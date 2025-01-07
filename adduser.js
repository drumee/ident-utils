#!/usr/bin/env node

const Organization = require("./lib/organization");
const Drumate = require("./lib/drumate");

const args = require('./args/adduser')
const { Cache, Attr } = require("@drumee/server-essentials");

const { exit } = process;


/**
 *  * 
 *   */
async function start() {
  await Cache.load();
  const org = new Organization();
  console.log("AAA:2aa4", args)
  if (!args.email.isEmail()) {
    throw ("Invalid email");
  }
  let domain = await org.createDomain(args.ident)
  console.log("AAA:domain", domain)
  let user = await org.createAdmin({
    ...args,
    domain: domain.name
  })
  console.log("User created", user)
  let o = await org.createOrganization({
    ident: args.ident,
    name: args.org_name || domain.name,
    uid: user.id,
    link: domain.name,
    domain_id: user.domain_id,
    owner_id: user.id
  });
  console.log("Organization created", o)
  // let User = new Drumate({ yp: org.yp, db_name: user.db_name });
  // await User.createHub({
  //   domain: domain.name,
  //   area: Attr.private,
  //   hostname: `${args.firstname}-private-sb`,
  //   filename: "My Internal Sharebox",
  //   owner_id: user.id
  // });

  // await User.createHub({
  //   domain: domain.name,
  //   area: Attr.dmz,
  //   hostname: `${args.firstname}-dmz-sb`,
  //   filename: "My Extenal Sharebox",
  //   owner_id: user.id
  // });

}

start()
  .then(() => {
    exit(0);
  })
  .catch((e) => {
    console.error(e);
    exit(1);
  });

