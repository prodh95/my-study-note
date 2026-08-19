import { notes } from './notes.js';
import { showLocalPdfs } from './site-mode.js';

const yearElement = document.querySelector('#year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

function createFileLink(note) {
  return `
    <a class="file-link" href="${note.pdf}" target="_blank" rel="noopener noreferrer">
      <span class="file-icon" aria-hidden="true">PDF</span>
      <span>${note.title}</span>
      <span class="file-open" aria-hidden="true">↗</span>
    </a>
  `;
}

const semesterOrder = ['大一上', '大一下', '大二上', '大二下'];
const directory = document.querySelector('#notes-directory');

function createSemesterSection(semester) {
  const semesterNotes = notes.filter((note) => note.semester === semester);
  const courses = [...new Set(semesterNotes.map((note) => note.course))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));

  if (!semesterNotes.length) {
    return `<details class="semester-folder"><summary><span>${semester}</span><small>尚未加入筆記</small></summary><p class="empty-notes">這個學期還沒有公開筆記。</p></details>`;
  }

  const courseFolders = courses.map((course) => {
    const courseNotes = semesterNotes.filter((note) => note.course === course);
    return `
      <details class="course-folder">
        <summary><span class="folder-icon" aria-hidden="true">⌁</span><span>${course}</span><small>${courseNotes.length} 份檔案</small></summary>
        <div class="file-list">${courseNotes.map(createFileLink).join('')}</div>
      </details>
    `;
  }).join('');

  return `
    <details class="semester-folder">
      <summary><span>${semester}</span><small>${courses.length} 個科目 · ${semesterNotes.length} 份檔案</small></summary>
      <div class="course-list">${courseFolders}</div>
    </details>
  `;
}

if (directory && !showLocalPdfs) {
  directory.innerHTML = `
    <div class="public-library-notice">
      <p class="eyebrow">PUBLIC DEMO</p>
      <h3>筆記檔案目前只在我的個人電腦保存。</h3>
      <p>這是網站版面與分類方式的公開展示。為了保護筆記內容與檔案授權，公開網站暫時不提供 PDF 閱讀。</p>
    </div>
  `;
}

if (directory && showLocalPdfs) {
  directory.innerHTML = semesterOrder.map(createSemesterSection).join('');
}

const localUpdateTip = document.querySelector('#local-update-tip');
if (localUpdateTip && !showLocalPdfs) localUpdateTip.hidden = true;
