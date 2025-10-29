  const puppeteer = require("puppeteer-extra");
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
  const fs = require("fs");
  const threshold = 0.7;
  const maxTime = 12 * 60 * 60 * 1000;
  let intervalId; // 🟩 הגדרה גלובלית מחוץ ל-try


  puppeteer.use(StealthPlugin());
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: process.env.API_KEY_CAPTCHA, // 🔁 החלף ב-API KEY האמיתי שלך
      },
      visualFeedback: true,
    })
  );

  // מקבל את כתובת הארנק מהשורה הראשונה של הפרמטרים
  const walletAddress = process.env.WALLET;
  if (!walletAddress) {
    console.error("❌ Please provide a wallet address.");
    process.exit(1);
  }

  (async () => {
    // קריאת קובץ ה-proxies.txt
    const proxyList = fs.readFileSync("proxies.txt", "utf8").split("\n").map(p => p.trim()).filter(p => p);

    // שייך לכל ארנק פרוקסי על בסיסס index
    const myIndex = process.env.CONTAINER_INDEX || 0;
    const proxy = proxyList[myIndex % proxyList.length];
    const proxyHost = proxy;
    const proxyPort = process.env.PROXY_SOCKET;
    const proxyUsername = process.env.PROXY_USERNAME; // 🔁 שים את שם המשתמש האמיתי
    const proxyPassword = process.env.PROXY_PASSWORD; // 🔁 שים את הסיסמה האמיתית

    const startTime = Date.now();


    const browser = await puppeteer.launch({
      headless: "new",
      args: [
          `--proxy-server=http://${proxyHost}:${proxyPort}`,
          "--proxy-bypass-list=*localhost",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-infobars",
          "--window-size=1920,1080"
      ]
      });

  const page = await browser.newPage();

  // 🟩 חובה עם פרוקסי שדורש אימות
  await page.authenticate({
    username: proxyUsername,
    password: proxyPassword
  });


  // ✅ הוספת השהיה לפני הניווט
  await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      console.log("🌐 Navigating to faucet...");
      await page.goto("https://sepolia-faucet.pk910.de/#/", { waitUntil: "domcontentloaded" });
      
      const content = await page.content();

      if (content.length < 1000) {
      console.error("❌ Page likely failed to load properly (empty content). Possible internet or proxy issue.");
      await browser.close();
      process.exit(1);
      }

      // הזנת כתובת הארנק
      await page.waitForSelector("input.form-control[placeholder*='ETH address']", { timeout: 100000 });
      await page.type("input.form-control[placeholder*='ETH address']", walletAddress, { delay: 50 });


  // 🔐 פתרון Captcha – תומך גם ב-hCaptcha וגם ב-reCAPTCHA
  try {
    console.log("🔎 Detecting CAPTCHA...");

    // נמתין למקסימום של 20 שניות לראות אם עולה iframe של אחד מהם
    await Promise.race([
      page.waitForSelector("iframe[src*='hcaptcha.com']", { timeout: 20000 }),
      page.waitForSelector("iframe[src*='recaptcha']", { timeout: 20000 })
    ]);

    const hcaptchaFrame = await page.$("iframe[src*='hcaptcha.com']");
    const recaptchaFrame = await page.$("iframe[src*='recaptcha']");

    if (!hcaptchaFrame && !recaptchaFrame) {
      console.log("ℹ️ No CAPTCHA detected.");
    } else {
      console.log(`🧠 Detected ${hcaptchaFrame ? "hCaptcha" : "reCAPTCHA"}`);
      const { solutions, error } = await page.solveRecaptchas();
      if (error) {
        console.error("❌ CAPTCHA failed:", error);
        await browser.close();
        process.exit(1);
      }
      console.log("🤖 CAPTCHA solved");
    }
  } catch (e) {
    console.error("❌ Error while solving CAPTCHA:", e);
    await browser.close();
    process.exit(1);
  }
      // התחלת הכרייה - המתן לכפתור
  try {
      await page.waitForSelector("button.start-action", { timeout: 10000 });
      await page.click("button.btn-success.start-action");
      console.log("🚀 Mining started...");
      } catch (e) {
      // ניפוי באגים: הדפס את כל הכפתורים הזמינים
      const allButtons = await page.$$eval("button", btns => btns.map(b => b.innerText.trim()));
      console.error("❌ Start button not found after waiting.");
      console.log("🧐 Available buttons:", allButtons);

      await browser.close();
      process.exit(1);
      }

      // פונקציית בדיקת תגמול
      const checkRewardAndStop = async () => {
          
        try {
          const fullText = await page.evaluate(() => document.body.innerText);
          console.log("📄 Page text:", fullText);
          const debugReward = await page.evaluate(() => {
          const elList = document.querySelectorAll("div.status-value");
          const el = elList[1];
          const debugInfo = {
              numElements: elList.length,
              elExists: !!el,
              elText: el ? el.innerText.trim() : null,
              matchResult: null,
              reward: null,
          };

          if (el) {
              const text = el.innerText.trim();
              const match = text.match(/([\d.]+)\s*SepETH/);
              debugInfo.matchResult = match;
              debugInfo.reward = match ? match[1] : null;
          }

          return debugInfo;
          });

          console.log("🔍 Debug info:");
          console.log("➡️ Found", debugReward.numElements, "elements with class 'status-value'");
          console.log("➡️ Element exists?", debugReward.elExists);
          console.log("➡️ Inner text:", debugReward.elText);
          console.log("➡️ Match result:", debugReward.matchResult);
          console.log("💰 Parsed reward:", debugReward.reward);
          

          const rewardValue = debugReward.reward ? parseFloat(debugReward.reward) : 0;
          console.log("💰 Parsed reward:", rewardValue);



          const durationMs = Date.now() - startTime;
          const minutes = Math.floor(durationMs / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000);
          console.log(`💰 Current Reward: ${rewardValue} SepETH | Elapsed: ${minutes}m ${seconds}s`);


          if (rewardValue >= threshold) {
            clearInterval(intervalId);
            console.log(rewardValue >= threshold
              ? `🛑 Threshold reached (${threshold} SepETH)`
              : `🕛 Max time reached (12 hours)`);
            const stopped = await page.evaluate(() => {
              const stopBtn = Array.from(document.querySelectorAll("button"))
                .find(btn => btn.innerText.trim() === "Stop Mining & Claim Rewards");
              if (stopBtn) {
                  stopBtn.click();
                  return true;
              } 
              return false;
            });
          if (stopped) {
              console.log("✅ Clicked 'Stop Mining' button successfully.");
          } else {
              console.log("⚠️ 'Stop Mining' button not found. Mining may still be running, shutting down");
              await browser.close();
              process.exit(1);
          }

          
          // נמתין קצת שייטען המסך החדש
          console.log("✅ Clicked 'Stop Mining' button. Waiting to load claim...");
          await new Promise(resolve => setTimeout(resolve, 4000));

                // נוודא שקיים כפתור claim rewards ונלחץ עליו
          const claimed = await page.evaluate(() => {
              const claimBtn = document.querySelector("button.btn-success.start-action");
              if (claimBtn) {
              claimBtn.click();
              return true;
              }
              return false;
          });
          if (claimed) {
              console.log("🎁 Claim button clicked:");
          } else {
              console.log("Claim button not found, shutting down");
              await browser.close();
              process.exit(1);
          }
          await new Promise(resolve => setTimeout(resolve, 120000));

          const success = await page.evaluate(() => {
              return !!document.querySelector("div.alert.alert-success");
            });

            if (success) {
              const durationMs = Date.now() - startTime;
              const minutes = Math.floor(durationMs / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              console.log(`✅ Successfully claimed SepETH after ${minutes}m ${seconds}s!`);
            } else {
              console.warn("⚠️ Claim button clicked, but no success message found, shutting down");
            }

          await new Promise(resolve => setTimeout(resolve, 3000));
          await browser.close();
          process.exit(0);
          }
        } catch (err) {
          console.error("❌ Error checking reward:", err);
        }
      };

      // בדיקה כל דקה
      intervalId = setInterval(checkRewardAndStop, 60_000);
      // ⏳ סגירת הדפדפן לאחר 15 דקות אם לא התקבל תגמול
      setTimeout(() => {
          console.warn("⏳ 12 hours reached, closing browser.");
          clearInterval(intervalId); // 🟩 הוספת שורת ביטול
          browser.close();
          process.exit(0);
      }, maxTime); // 12 שעות

    } catch (err) {
      console.error("❌ Failed:", err);
      clearInterval(intervalId);
      await browser.close();
      process.exit(1);
    }
  })();

