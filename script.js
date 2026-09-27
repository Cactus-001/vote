// ============================================================
// 1. 数据与 DOM
// ============================================================
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const publishBtn = document.getElementById('publishBtn');
const removeBtn = document.getElementById('removeBtn');
const worksGrid = document.getElementById('worksGrid');
const emptyTip = document.getElementById('emptyTip');
const topVotesCount = document.getElementById('topVotesCount');
const topVotesBadge = document.getElementById('topVotesBadge');
// 【新增】姓名输入框
const nameInput = document.getElementById('nameInput');
const schoolInput = document.getElementById('schoolInput');
const studentIdInput = document.getElementById('studentIdInput');
// 弹窗
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// 当前待发布的图片
let pendingImage = null;

// 作品列表
const works = [];

// ============================================================
// 2. 选择图片 → 显示预览
// ============================================================
fileInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件！');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    pendingImage = e.target.result;
    previewImage.src = pendingImage;
    previewArea.classList.add('active');
  };
  reader.readAsDataURL(file);
});

// ============================================================
// 3. 发布作品（【修改】校验姓名、学校、学号）
// ============================================================
publishBtn.addEventListener('click', function () {
  if (!pendingImage) {
    alert('请先选择一张图片！');
    return;
  }

  // --- 校验姓名 ---
  const name = nameInput.value.trim();
  if (!name) {
    alert('请填写姓名！');
    nameInput.focus();
    return;
  }

  // --- 校验学校 ---
  const school = schoolInput.value.trim();
  if (!school) {
    alert('请填写学校名称！');
    schoolInput.focus();
    return;
  }

  // --- 校验学号 ---
  const studentId = studentIdInput.value.trim();
  if (!studentId) {
    alert('请填写学号！');
    studentIdInput.focus();
    return;
  }

  // --- 创建作品对象（含姓名）---
  const newWork = {
    id: 'work-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    image: pendingImage,
    name: name,
    school: school,
    studentId: studentId,
    votes: 0
  };
  works.push(newWork);

  renderWorkCard(newWork);
  updateEmptyTip();
  updateTopVotes();

  clearPreview();

  setTimeout(() => {
    const card = document.getElementById(newWork.id);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('vote-pop');
      setTimeout(() => card.classList.remove('vote-pop'), 400);
    }
  }, 100);
});

// ============================================================
// 4. 取消上传（【修改】清空姓名输入框）
// ============================================================
removeBtn.addEventListener('click', clearPreview);

function clearPreview() {
  fileInput.value = '';
  nameInput.value = '';       // 【新增】
  schoolInput.value = '';
  studentIdInput.value = '';
  pendingImage = null;
  previewImage.src = '';
  previewArea.classList.remove('active');
}

// ============================================================
// 5. 渲染作品卡片（【修改】显示姓名）
// ============================================================
function renderWorkCard(work) {
  const card = document.createElement('div');
  card.className = 'work-card';
  card.id = work.id;

  const img = document.createElement('img');
  img.className = 'work-image';
  img.src = work.image;
  img.alt = '参赛作品';
  card.appendChild(img);

  const metaDiv = document.createElement('div');
  metaDiv.className = 'work-meta';

  // 【新增】姓名
  const nameEl = document.createElement('div');
  nameEl.className = 'work-name';
  nameEl.innerHTML = `👤 ${escapeHtml(work.name)}`;
  metaDiv.appendChild(nameEl);

  // 学校
  const schoolEl = document.createElement('div');
  schoolEl.className = 'work-school';
  schoolEl.innerHTML = `🏫 ${escapeHtml(work.school)}`;
  metaDiv.appendChild(schoolEl);

  // 学号
  const studentIdEl = document.createElement('div');
  studentIdEl.className = 'work-student-id';
  studentIdEl.innerHTML = `🆔 ${escapeHtml(work.studentId)}`;
  metaDiv.appendChild(studentIdEl);

  card.appendChild(metaDiv);

  const votesDiv = document.createElement('div');
  votesDiv.className = 'work-votes';
  votesDiv.id = 'votes-' + work.id;
  votesDiv.innerHTML = `${work.votes} <span class="small-label">票</span>`;
  card.appendChild(votesDiv);

  const voteBtn = document.createElement('button');
  voteBtn.className = 'vote-btn';
  voteBtn.innerHTML = '<span>👍</span> 投一票';
  voteBtn.addEventListener('click', () => handleVote(work.id));
  card.appendChild(voteBtn);

  worksGrid.appendChild(card);
}

// ============================================================
// 6. 投票
// ============================================================
function handleVote(workId) {
  const work = works.find(w => w.id === workId);
  if (!work) return;

  work.votes += 1;

  const votesDiv = document.getElementById('votes-' + workId);
  if (votesDiv) {
    votesDiv.innerHTML = `${work.votes} <span class="small-label">票</span>`;
    votesDiv.classList.add('vote-pop');
    setTimeout(() => votesDiv.classList.remove('vote-pop'), 300);
  }

  updateTopVotes();
}

// ============================================================
// 7. 更新最高票数
// ============================================================
function updateTopVotes() {
  if (works.length === 0) {
    topVotesCount.textContent = '0';
    return;
  }

  const maxVotes = Math.max(...works.map(w => w.votes));
  topVotesCount.textContent = maxVotes;

  topVotesBadge.classList.add('vote-pop');
  setTimeout(() => topVotesBadge.classList.remove('vote-pop'), 300);
}

// ============================================================
// 8. 空状态控制
// ============================================================
function updateEmptyTip() {
  emptyTip.style.display = works.length === 0 ? 'block' : 'none';
}

// ============================================================
// 9. 防止 XSS
// ============================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// 10. 打开 / 关闭最高票作品弹窗（【修改】显示姓名）
// ============================================================
function openTopWorkModal() {
  if (works.length === 0) {
    modalContent.innerHTML = `<div class="modal-empty">🎨 还没有作品哦～</div>`;
    modalOverlay.classList.add('active');
    return;
  }

  let topWork = works[0];
  for (const w of works) {
    if (w.votes > topWork.votes) topWork = w;
  }

  // 【修改】弹窗里也加入姓名
  modalContent.innerHTML = `
    <img class="modal-image" src="${topWork.image}" alt="最高票作品" />
    <div class="modal-info">
      <div class="modal-name">👤 ${escapeHtml(topWork.name)}</div>
      <div class="modal-school">🏫 ${escapeHtml(topWork.school)}</div>
      <div class="modal-student-id">🆔 ${escapeHtml(topWork.studentId)}</div>
      <div class="modal-votes">${topWork.votes} <span class="small-label">票</span></div>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeTopWorkModal() {
  modalOverlay.classList.remove('active');
}

topVotesBadge.addEventListener('click', openTopWorkModal);
modalCloseBtn.addEventListener('click', closeTopWorkModal);

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) closeTopWorkModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeTopWorkModal();
  }
});

// 初始化
updateEmptyTip();