const {
  Mariadb, Logger, uniqueId, sysEnv
} = require("@drumee/server-essentials");
const { mkdirSync, rmSync } = require("fs");
const { tmp_dir } = sysEnv();

class Mfs extends Logger {
  /**
    * 
    * @param {*} opt 
    */
  initialize(opt = {}) {
    this.yp = opt.yp || new Mariadb({ name: "yp" });
  }


  /**
   * 
   */
  async end() {
    if (this.db) {
      await this.db.stop();
    }
    if (this.yp) {
      await this.yp.stop();
    }
  }



}
module.exports = Mfs;