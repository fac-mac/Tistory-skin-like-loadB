function layer_toggle(obj) {
  if (obj.style.display == "none") obj.style.display = "block";
  else if (obj.style.display == "block") obj.style.display = "none";
}

function makeArticleMoreLess() {
  const list = document.querySelectorAll(`div[data-ke-type='moreLess']`);
  list.forEach(function (element) {
    const btn = element.querySelector("a.btn-toggle-moreless");
    const line = element.querySelector("div.moreless-content p");
    if (line.innerText.substr(0, 4) === "#접기 ") {
      const title = line.innerText.substr(4);
      element.setAttribute("data-text-more", title);
      btn.innerText = title;
      line.remove();
    }
  });
} /* 참고한 코드: https://pang2h.tistory.com/254 */

function changeCommentLine(line, item) {
  const button = `
  <br>
  <button class="commentMoreLess" type="button" onclick="layer_toggle(this.parentNode.querySelector('.repContent'));">
    ▼ ${line.substr(4)}
  </button>`;
  item.querySelector(".repContent").insertAdjacentHTML("beforebegin", button);
  if (item.innerHTML.indexOf(line + "<br>") == -1)
    item.innerHTML = item.innerHTML.replace(line, "");
  else item.innerHTML = item.innerHTML.replace(line + "<br>", "");
  item.querySelector(".repContent").style = "display: none;";
}

function makeCommentMoreLess(list) {
  list.forEach(function (element) {
    const split = element.querySelector(".repContent").innerText.split("\n");
    if (split[0] != null && split[0].substr(0, 4) === "#접기 ")
      changeCommentLine(split[0], element);
    else if (split[1] != null && split[1].substr(0, 4) === "#접기 ")
      changeCommentLine(split[1], element);
  });
}

function changeMemoLine(line, item) {
  const span = `
  <br>
  <span class="memo">
    memo. ${line.substr(4)}
  </span>`;
  if (item.innerHTML.indexOf(line + "<br>") == -1)
    item.innerHTML = item.innerHTML.replace(line, "");
  else item.innerHTML = item.innerHTML.replace(line + "<br>", "");
  item.querySelector(".comment__control").insertAdjacentHTML("afterend", span);
}

function makeMemo(list) {
  list.forEach(function (element) {
    const split = element.querySelector(".repContent").innerText.split("\n");
    if (split[0] != null && split[0].substr(0, 4) === "#메모 ")
      changeMemoLine(split[0], element);
    else if (split[1] != null && split[1].substr(0, 4) === "#메모 ")
      changeMemoLine(split[1], element);
  });
}

function showBoardMenu() {
  document.querySelector("#board-menu").style.display = "flex";
}

async function getEmoticonList(blogLink) {
  const res = await fetch(`${blogLink}pages/emoticon`);
  if (!res.ok) return null;
  const txt = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(txt, "text/html");
  const table = doc.querySelectorAll("td");
  const emoticons = [];
  table.forEach(function (element) {
    const img = element.querySelector("img");
    const cmd = element.innerText.trim();
    if (img != null && cmd != null) emoticons.push({ cmd: cmd, src: img.src });
  });
  return emoticons;
}

function changeEmoticon(rpList, emoticons) {
  emoticons.forEach(function (obj) {
    rpList.forEach(function (rp) {
      const content = rp.querySelector(".repContent").innerHTML;
      if (content.indexOf(obj.cmd) != -1) {
        rp.querySelector(".repContent").innerHTML = content.replace(
          RegExp(obj.cmd, "gm"),
          `<img src="` + obj.src + `">`
        );
      }
    });
  });
}

function changeArticleEmoticon(emoticons) {
  const articles = document.querySelectorAll("article");
  emoticons.forEach(function (obj) {
    articles.forEach(function (article) {
      const CLASS_NAME = "container_postbtn";
      const content = article
        .querySelector(".article__content")
        .innerHTML.split(CLASS_NAME);
      const pureContent = content[0];
      if (pureContent.indexOf(obj.cmd) != -1) {
        article.querySelector(".article__content").innerHTML =
          pureContent.replace(
            RegExp(obj.cmd, "gm"),
            `<img src="` + obj.src + `">`
          ) +
          CLASS_NAME +
          content[1];
      }
    });
  });
}

function changeImage(list) {
  let pos;
  list.forEach(function (element) {
    const split = element.querySelector(".repContent").innerHTML.split("<br>");
    split.forEach(function (content) {
      while ((pos = content.indexOf("#이미지 ")) != -1) {
        const src = content.substr(pos + 5).split(/(<br>)|\s/, 1)[0];
        if (src != null && src.indexOf("http") != -1) {
          const replaced = content.replace(
            "#이미지 " + src,
            `<img src="` + src + `">`
          );
          element.querySelector(".repContent").innerHTML = element
            .querySelector(".repContent")
            .innerHTML.replace(content, replaced);
          content = replaced;
        } else break;
      }
    });
  });
}

function changeLink(list) {
  let pos;
  list.forEach(function (element) {
    const split = element.querySelector(".repContent").innerHTML.split("<br>");
    split.forEach(function (content) {
      while ((pos = content.indexOf("#링크 ")) != -1) {
        const src = content.substr(pos + 4).split(/(<br>)|\s/, 1)[0];
        if (src != null && src.indexOf("http") != -1) {
          const replaced = content.replace(
            "#링크 " + src,
            `<a href="` +
              src +
              `" target="_blank" rel="noopener">` +
              src +
              "</a>"
          );
          element.querySelector(".repContent").innerHTML = element
            .querySelector(".repContent")
            .innerHTML.replace(content, replaced);
          content = replaced;
        } else break;
      }
    });
  });
}

function changeSecret(list) {
  list.forEach(function (element) {
    element.innerHTML = element.innerHTML.replace(
      "비밀댓글입니다",
      "<span class='rpSecretBox'>secret</span>"
    );
  });
}

const DATA_TSLB_PROCESSED = "tslbProcessed";

function runScript({ blogLink, articleEmoticon, progressBar, retryCount }) {
  window.addEventListener("load", async function () {
    const emoticonList = await getEmoticonList(blogLink);
    const run = async () => {
      const rpList = window.document.querySelectorAll(
        ".rp_general, .rp_admin, .rp_secret, .guest_admin, .guest_general, .guest_secret"
      );
      const filteredRpList = Array.from(rpList).filter(
        (rp) => rp.dataset[DATA_TSLB_PROCESSED] !== "true"
      );

      await makeMemo(filteredRpList);
      await makeCommentMoreLess(filteredRpList);
      await changeImage(filteredRpList);
      await changeLink(filteredRpList);
      if (window.location.pathname != "/pages/emoticon") {
        if (emoticonList != null && emoticonList.length !== 0) {
          await changeEmoticon(rpList, emoticonList);
        }
      }
      await changeSecret(filteredRpList);

      filteredRpList.forEach((rp) => {
        rp.dataset[DATA_TSLB_PROCESSED] = true;
      });
    };

    await makeArticleMoreLess();
    if (window.location.pathname != "/pages/emoticon") {
      if (emoticonList != null && emoticonList.length !== 0) {
        if (articleEmoticon) await changeArticleEmoticon(emoticonList);
      }
    }

    const actualRetryCount = Number.isSafeInteger(Number(retryCount))
      ? Number(retryCount)
      : 1 || 1;
    const retryArray = Array(actualRetryCount).map((_, i) => i);
    for await (const cnt of retryArray) {
      await run();
      if (cnt !== actualRetryCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    if (progressBar) {
      const loading = document.querySelector(".loading");
      loading.classList.add("hidden");
    }
  });

  window.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname == "/pages/emoticon")
      document.querySelector("nav").style.display = "none";
    else if (window.location.pathname.indexOf("/category") != -1) {
      showBoardMenu();
    }
  });
}
