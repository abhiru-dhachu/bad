const got = require("got");
const Heroku = require("heroku-client");
const { bot,secondsToDHMS } = require("../lib/");
const Config = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;
bot(
  {
    pattern: "restart$",
    fromMe: true,
    desc: "Restart Dyno",
    type: "heroku",
  },
  async (message) => {
    await message.reply(`_Restarting_`);
    await heroku.delete(baseURI + "/dynos").catch(async (error) => {
      await message.sendMessage(`HEROKU : ${error.body.message}`);
    });
  }
);
bot(
  {
    pattern: "shutdown$",
    fromMe: true,
    desc: "Dyno off",
    type: "heroku",
  },
  async (message) => {
    await heroku
      .get(baseURI + "/formation")
      .then(async (formation) => {
        await message.reply(`_Shutting down._`);
        await heroku.patch(baseURI + "/formation/" + formation[0].id, {
          body: {
            quantity: 0,
          },
        });
      })
      .catch(async (error) => {
        await message.reply(`HEROKU : ${error.body.message}`);
      });
  }
);
bot(
  {
    pattern: "dyno$",
    fromMe: true,
    desc: "Show Quota info",
    type: "heroku",
  },
  async (message) => {
    try {
      heroku
        .get("/account")
        .then(async (account) => {
          const url = `https://api.heroku.com/accounts/${account.id}/actions/get-quota`;
          headers = {
            "User-Agent": "Chrome/80.0.3987.149 Mobile Safari/537.36",
            Authorization: "Bearer " + Config.HEROKU_API_KEY,
            Accept: "application/vnd.heroku+json; version=3.account-quotas",
          };
          const res = await got(url, { headers });
          const resp = JSON.parse(res.body);
          const total_quota = Math.floor(resp.account_quota);
          const quota_used = Math.floor(resp.quota_used);
          const remaining = total_quota - quota_used;
          const quota = `Total Quota : ${secondsToDHMS(total_quota)}
Used  Quota : ${secondsToDHMS(quota_used)}
Remaning    : ${secondsToDHMS(remaining)}`;
          await message.reply("```" + quota + "```");
        })
        .catch(async (error) => {
          return await message.reply(`HEROKU : ${error.body.message}`);
        });
    } catch (error) {
      await message.reply(error);
    }
  }
);
bot(
  {
    pattern: "setvar ?(.*)",
    fromMe: true,
    desc: "Set heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match)
      return await message.reply(`_Example: .setvar SUDO:918113921898_`);
    const [key, value] = match.split(":");
    if (!key || !value)
      return await message.reply(`_Example: .setvar SUDO:918113921898_`);
    heroku
      .patch(baseURI + "/config-vars", {
        body: {
          [key.toUpperCase()]: value,
        },
      })
      .then(async () => {
        await message.reply(`_${key.toUpperCase()}: ${value}_`);
      })
      .catch(async (error) => {
        await message.reply(`HEROKU : ${error.body.message}`);
      });
  }
);

bot(
  {
    pattern: "delvar ?(.*)",
    fromMe: true,
    desc: "Delete Heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match) return await message.reply(`_Example: delvar sudo_`);
    heroku
      .get(baseURI + "/config-vars")
      .then(async (vars) => {
        const key = match.trim().toUpperCase();
        if (vars[key]) {
          await heroku.patch(baseURI + "/config-vars", {
            body: {
              [key]: null,
            },
          });
          return await message.reply(`_Deleted ${key}_`);
        }
        await message.reply(`_${key} not found_`);
      })
      .catch(async (error) => {
        await message.reply(`HEROKU : ${error.body.message}`);
      });
  }
);
bot(
  {
    pattern: "getvar ?(.*)",
    fromMe: true,
    desc: "Show heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match) return await message.reply(`_Example: getvar sudo_`);
    const key = match.trim().toUpperCase();
    heroku
      .get(baseURI + "/config-vars")
      .then(async (vars) => {
        if (vars[key]) {
          return await message.send(
            "_{} : {}_".replace("{}", key).replace("{}", vars[key])
          );
        }
        await message.reply(`${key} not found`);
      })
      .catch(async (error) => {
        await message.send(`HEROKU : ${error.body.message}`);
      });
  }
);
bot(
  {
    pattern: "allvar$",
    fromMe: true,
    desc: "Heroku all env",
    type: "heroku",
  },
  async (message) => {
    let msg = "```Here your all Heroku vars\n\n\n";
    heroku
      .get(baseURI + "/config-vars")
      .then(async (keys) => {
        for (const key in keys) {
          msg += `${key} : ${keys[key]}\n\n`;
        }
        return await message.reply(msg + "```");
      })
      .catch(async (error) => {
        await message.reply(`HEROKU : ${error.body.message}`);
      });
  }
);
bot(
  {
    pattern: "update$",
    fromMe: true,
    desc: "Checks for update.",
  },
  async (message) => {
    await git.fetch();
    var commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);
    if (commits.total === 0) {
      await message.reply("_Already on latest version_");
    } else {
      var updates = "Update Available*\n\n\n Changes:\n```";
      commits["all"].map((commit) => {
        updates +=
          "🔹 [" +
          commit.date.substring(0, 10) +
          "]: " +
          commit.message +
          " <" +
          commit.author_name +
          ">\n";
      });

      await message.reply(updates + "```");
    }
  }
);
bot(
  {
    pattern: "update now$",
    fromMe: true,
    dontAddCommandList: true,
    desc: "Updates the Bot",
  },
  async (message) => {
    await git.fetch();
    var commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);
    if (commits.total === 0) {
      return await message.reply("_Already on latest version_");
    } else {
      await message.reply("_Updating_");
      if (Config.HEROKU) {
        try {
          var app = await heroku.get("/apps/" + Config.HEROKU_APP_NAME);
        } catch {
          await message.reply("_Invalid Heroku Details_");
          await new Promise((r) => setTimeout(r, 1000));
        }

        git.fetch("upstream", Config.BRANCH);
        git.reset("hard", ["FETCH_HEAD"]);

        var git_url = app.git_url.replace(
          "https://",
          "https://api:" + Config.HEROKU_API_KEY + "@"
        );

        try {
          await git.addRemote("heroku", git_url);
        } catch {
          console.log("heroku remote error");
        }
        await git.push("heroku", Config.BRANCH);

        await message.reply("UPDATED");
      } else {
        git.pull(async (err, update) => {
          if (update && update.summary.changes) {
            await message.reply("UPDATED");
            exec("npm install").stderr.pipe(process.stderr);
          } else if (err) {
            await message.reply(
              "*❌ Update failed!*\n*Error:* ```" + err + "```"
            );
          }
        });
      }
    }
  }
);
