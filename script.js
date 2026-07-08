const frameworkData = {
  axis: {
    tag: "第一模块",
    title: "先找同一标的的“B 厅”，再谈错价。",
    body:
      "判断乌龙指的关键不是跌停、暴跌或影线，而是同一时间是否存在可验证的参考坐标：同平台不同规格、不同平台同品种、可换算的现货/期货/份额，或者可以同步锁定风险的一组标的。",
    points: ["参考系判断清单。", "同标的映射表模板。", "不成立案例库，帮助你少踩坑。"],
  },
  pool: {
    tag: "第二模块",
    title: "小池子出错，大池子定价。",
    body:
      "小池子是局部报价和局部流动性，大池子是更稳定的公允价格来源。训练营会把“看见便宜”拆成“确认小池子是否偏离大池子”的流程。",
    points: ["小池子/大池子拆解表。", "费用、滑点、退出深度计算。", "是否需要同步对冲的判断规则。"],
  },
  wait: {
    tag: "第三模块",
    title: "等错来，是长期蹲守，不是消息提醒。",
    body:
      "错单出现是低频概率事件。这里训练的是观察体系、记录方法和复盘能力，而不是承诺你马上捡到一次机会。",
    points: ["7 天观察任务。", "候选坑位评分表。", "复盘日志，区分判断正确和运气好。"],
  },
  ethic: {
    tag: "第四模块",
    title: "只捡自然错价，不做诱导和漏洞攻击。",
    body:
      "相关文章里反复强调生态边界：自然错单是一回事，设托诱导别人犯错、利用系统漏洞、操纵冷清盘口是另一回事。这个边界决定学习是否能够长期、正当地持续。",
    points: ["合规红线清单。", "不适合参与的情形。", "风险提示和免责声明。"],
  },
};

const tabs = document.querySelectorAll(".framework-tab");
const panel = document.querySelector("#frameworkPanel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const data = frameworkData[tab.dataset.tab];
    panel.innerHTML = `
      <p class="tag">${data.tag}</p>
      <h3>${data.title}</h3>
      <p>${data.body}</p>
      <ul>${data.points.map((point) => `<li>${point}</li>`).join("")}</ul>
    `;
  });
});

const checklist = document.querySelector("#checklist");
const scoreValue = document.querySelector("#scoreValue");
const scoreRing = document.querySelector("#scoreRing");
const scoreTitle = document.querySelector("#scoreTitle");
const scoreText = document.querySelector("#scoreText");
const scoreCta = document.querySelector("#scoreCta");

function updateScore() {
  const checked = [...checklist.querySelectorAll("input:checked")];
  const score = checked.reduce((sum, input) => sum + Number(input.value), 0);
  scoreValue.textContent = score;
  scoreRing.style.background = `
    radial-gradient(circle at center, #111714 57%, transparent 58%),
    conic-gradient(#c57921 ${score * 3.6}deg, rgba(255, 250, 240, 0.12) 0deg)
  `;

  if (score >= 82) {
    scoreTitle.textContent = "适合进入系统学习";
    scoreText.textContent = "你更适合观察模板课或闭门研究微信小圈子。下一步是提交基础信息，选择适合你的方案。";
    scoreCta.classList.remove("hidden");
  } else if (score >= 52) {
    scoreTitle.textContent = "建议先看资料包";
    scoreText.textContent = "你已经理解一部分框架，可以先用资料包建立判断标准。";
    scoreCta.classList.remove("hidden");
  } else {
    scoreTitle.textContent = "暂时不建议购买";
    scoreText.textContent = "如果你需要的是喊单、内幕或固定收益承诺，这里不适合你。";
    scoreCta.classList.add("hidden");
  }
}

checklist.addEventListener("change", updateScore);
updateScore();

document.querySelectorAll("[data-plan]").forEach((link) => {
  link.addEventListener("click", () => {
    const select = document.querySelector("#planSelect");
    if (!select) {
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const plan = link.dataset.plan;
    const option = [...select.options].find((item) => item.textContent.includes(plan));
    if (option) select.value = option.value;
  });
});

const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");

if (leadForm) {
leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = event.target.querySelector("button[type='submit']");
  const lead = {
    plan: document.querySelector("#planSelect").value,
    contact: document.querySelector("#contactInput").value,
    note: document.querySelector("#noteInput").value,
    sourceUrl: window.location.href,
    createdAt: new Date().toISOString(),
  };

  submitButton.disabled = true;
  formStatus.textContent = "正在提交...";

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!response.ok) throw new Error("submit failed");
    const result = await response.json();
    const leads = JSON.parse(localStorage.getItem("wulongzhiLeads") || "[]");
    leads.push({ ...lead, id: result.id });
    localStorage.setItem("wulongzhiLeads", JSON.stringify(leads));
    formStatus.textContent = "已提交。我会按你填写的微信号添加你，也可以主动加我微信并备注“乌龙指”。";
    leadForm.reset();
  } catch {
    const leads = JSON.parse(localStorage.getItem("wulongzhiLeads") || "[]");
    leads.push(lead);
    localStorage.setItem("wulongzhiLeads", JSON.stringify(leads));
    formStatus.textContent = "提交暂时失败。请直接复制微信号添加我，并备注“乌龙指”。";
  } finally {
    submitButton.disabled = false;
  }
});
}

async function copyWechatId(button) {
  const value = document.querySelector("#wechatId").textContent.trim();
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "已复制";
    if (formStatus) formStatus.textContent = "微信号已复制，请添加并备注“乌龙指”。";
  } catch {
    button.textContent = value;
  }
}

document.querySelector("#copyWechat")?.addEventListener("click", async (event) => {
  copyWechatId(event.currentTarget);
});

document.querySelector("#copyWechatSecondary")?.addEventListener("click", async (event) => {
  copyWechatId(event.currentTarget);
});
