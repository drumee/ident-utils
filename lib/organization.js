const {
  toArray, Mariadb, Logger, Remit, Attr, Constants,
  uniqueId, sysEnv
} = require("@drumee/server-essentials");
const diskSpace = require("check-disk-space").default;
const { isEmpty, isString } = require('lodash');

const {
  FORGOT_PASSWORD,
} = Constants;
const { join } = require("path");
const {
  domain,
  credential_dir,
  data_dir,
  main_domain
} = sysEnv();


const { ADMIN_EMAIL, ACME_EMAIL_ACCOUNT } = process.env;
const { DOM_OWNER } = Remit;
const EMAIL_CREDENTIAL = join(credential_dir, "email.json");

const Drumate = require("./drumate");
global.verbosity = 4;
global.LOG_LEVEL = global.verbosity;


class Organization extends Logger {
  initialize(opt = {}) {
    this.yp = new Mariadb({ name: "yp" });
  }



  /***
   * 
   */
  async remove(id) {
    if (!id) {
      this.debug("AAA:94 -- require name or id");
      return []
    }
    let dom = await this.yp.await_query(`SELECT * FROM domain WHERE id=?`, id);
    let drumate = new Drumate({ yp: this.yp });
    let users = [];
    if (dom && dom.id) {
      this.debug("Removing", dom);
      users = await this.yp.await_query(`SELECT id, email FROM drumate WHERE domain_id=?`, dom.id);
      for (let peer of toArray(users)) {
        drumate.remove(peer);
        await this.yp.await_query(`DELETE FROM map_role WHERE uid=?`, peer.id);
        await this.yp.await_query(`DELETE FROM privilege WHERE uid=?`, peer.id);
        await this.yp.await_query(`DELETE FROM cookie WHERE uid=?`, peer.id);
        await this.yp.await_query(`DELETE FROM socket WHERE uid=?`, peer.id);
      }
      await this.yp.await_query(`DELETE FROM hub WHERE domain_id=?`, id);
      await this.yp.await_query(`DELETE FROM organisation WHERE domain_id=?`, id);
      await this.yp.await_query(`DELETE FROM domain WHERE id=?`, id);
      await this.yp.await_query(`DELETE FROM vhost WHERE dom_id=?`, id);
      await this.yp.await_query(`DELETE FROM map_role WHERE org_id=?`, id);
    }
    let entities = this.yp.await_query(`SELECT * FROM entity WHERE id=?`, id);
    for (let e of toArray(entities)) {
      console.log("deleting", e.id);
      await this.yp.await_proc(`entity_delete`, e.id);
    }
    return users;
  }

  /**
   * 
   */
  async createDomain(ident) {
    ident = ident.toLowerCase();
    let domain_url = `${ident}.${main_domain}`;
    let dom = await this.yp.await_proc('domain_exists', domain_url);
    if (dom && dom[0]) dom = dom[0];
    if (dom && dom.id) {
      console.log(`Ident ${ident} already exists`, dom);
      return dom;
    }

    dom = await this.yp.await_proc('domain_create', ident);
    return dom;
  }

  /**
   * 
   */
  async createOrganization(opt) {
    let { ident, name, uid, link, domain_id, owner_id } = opt;
    ident = ident.toLowerCase();
    let org = await this.yp.await_proc('organisation_get', link)
    if (isEmpty(org)) {
      org = await this.yp.await_proc('organisation_add',
        uid, name, link, ident, domain_id, JSON.stringify({ domain_id, owner_id }));
    }
    return org;

  }


  /**
  * 
  */
  async createAdmin(opt) {
    let { domain, email, firstname, lastname, privilege, username } = opt;
    if (!domain || !email || !firstname || !lastname) {
      console.log("Missing data", opt);
      return
    }
    let User = new Drumate({ yp: this.yp });
    if (!username) {
      username = email.split('@')[0];
    }
    let admin = await User.create({
      domain,
      privilege: privilege || DOM_OWNER,
      firstname,
      lastname,
      username,
      email,
      category: "regular",
    });
    console.log("admin", admin)

    let df = await diskSpace(data_dir);
    this.debug(`Checking disk space allocated to MFS ${data_dir}`);
    let { free } = df;
    free = free || 10000000;
    free = free * 0.75;
    let quota = {
      share_hub: 9999999,
      private_hub: 9999999,
      watermark: "Infinity",
      disk: free,
      desk_disk: free,
      hub_disk: free
    };

    await this.yp.await_proc("drumate_update_profile", admin.id, { quota });

    const token = uniqueId();
    let name = [firstname, lastname].join(" ");
    await this.yp.await_proc(
      "token_generate_next",
      email,
      name,
      token,
      FORGOT_PASSWORD,
      admin.id
    );
    admin.reset_link = `https://${domain}/-/#/welcome/reset/${admin.id}/${token}`;

    console.log("Init link:", admin.reset_link);
    return { ...admin, domain };
  }


}
module.exports = Organization;