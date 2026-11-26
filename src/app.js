const app = document.querySelector('#app');

app.innerHTML = `
  <form>
    <label for="name">名前</label>
    <input id="name" name="name" type="text">
    <button type="submit">送信</button>
    <p id="name-error" role="alert" hidden>名前を入力してください</p>
    <p id="submission-status" role="status" hidden>受付完了</p>
  </form>
`;

const form = app.querySelector('form');
const nameInput = form.querySelector('#name');
const nameError = form.querySelector('#name-error');
const submissionStatus = form.querySelector('#submission-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const isBlank = nameInput.value.trim() === '';
  nameError.hidden = !isBlank;
  submissionStatus.hidden = isBlank;

  if (isBlank) {
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.setAttribute('aria-describedby', nameError.id);
    nameInput.focus();
  } else {
    nameInput.removeAttribute('aria-invalid');
    nameInput.removeAttribute('aria-describedby');
  }
});
