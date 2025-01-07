#!/usr/bin/env node

const Organization = require("./lib/organization");
const args = require('./args/remove-domain')
const { Cache } = require("@drumee/server-essentials");
const { exit } = process;


/**
 *  * 
 *   */
async function start() {
  await Cache.load();
  const org = new Organization();
  if (args.id < 2) {
    console.log("Domain id must be higher than 1");
    exit(1)
  }
  await org.remove(args.id)
}

start()
  .then(() => {
    exit(0);
  })
  .catch((e) => {
    console.error(e);
    exit(1);
  });

