const $ = (id) => document.getElementById(id);

const passwordEl = $("password");
const lengthEl = $("length");
const rangeEl = $("length-range");
const strengthFill = $("strength-fill");
const strengthText = $("strength-text");
const strengthPercent = $("strength-percent");
const strengthDot = $("strength-dot");
const entropyText = $("entropy-text");
const crackTime = $("crack-time");

const boxes = {
  uppercase: $("uppercase"),
  lowercase: $("lowercase"),
  numbers: $("numbers"),
  symbols: $("symbols")
};

const sets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%&*+-=?"
};

const defaults = { length: 13, uppercase: true, lowercase: true, numbers: true, symbols: true };

function randomChar(text) {
  return text[Math.floor(Math.random() * text.length)];
}

function shuffle(text) {
  const array = text.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}

function selectedSets() {
  return Object.keys(boxes).filter(key => boxes[key].checked).map(key => sets[key]);
}

function generatePassword() {
  let chosen = selectedSets();

  if (chosen.length === 0) {
    boxes.uppercase.checked = true;
    chosen = [sets.uppercase];
  }

  const all = chosen.join("");
  const length = Number(rangeEl.value);
  let password = "";

  chosen.forEach(set => {
    if (password.length < length) password += randomChar(set);
  });

  while (password.length < length) {
    password += randomChar(all);
  }

  passwordEl.textContent = shuffle(password);
  updateStrength(all.length, length);
}

function updateStrength(alphabet, length) {
  const entropy = alphabet > 1 ? length * Math.log2(alphabet) : 0;
  let percent, label, message;

  if (entropy < 35) {
    percent = 25; label = "FRACA";
    message = "Essa combinação possui poucas possibilidades e pode ser descoberta mais facilmente.";
  } else if (entropy < 60) {
    percent = 55; label = "MÉDIA";
    message = "Aumentar o tamanho ou incluir mais tipos de caracteres deixa a senha mais resistente.";
  } else if (entropy < 90) {
    percent = 80; label = "FORTE";
    message = "A quantidade de combinações já é grande, tornando a descoberta muito mais difícil.";
  } else {
    percent = 100; label = "MUITO FORTE";
    message = "Excelente! O tamanho e a variedade criam uma quantidade muito grande de combinações possíveis.";
  }

  strengthFill.style.width = percent + "%";
  strengthPercent.textContent = percent + "%";
  strengthText.textContent = label;
  entropyText.textContent = entropy >= 60 ? "Alta entropia" : "Entropia moderada";
  crackTime.textContent = message;

  const strong = percent >= 80;
  strengthDot.style.background = strong ? "#36e59a" : "#f2bd4d";
  strengthDot.style.boxShadow = `0 0 9px ${strong ? "#36e59a" : "#f2bd4d"}`;
  strengthText.style.color = strong ? "#36e59a" : "#f2bd4d";
}

rangeEl.addEventListener("input", () => {
  lengthEl.textContent = rangeEl.value;
  generatePassword();
});

Object.values(boxes).forEach(box => box.addEventListener("change", generatePassword));

$("generate").addEventListener("click", generatePassword);

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(passwordEl.textContent);
    $("copy").innerHTML = "✓ <span>Copiada!</span>";
    setTimeout(() => $("copy").innerHTML = "📋 <span>Copiar</span>", 1200);
  } catch {
    alert("Não foi possível copiar automaticamente. Selecione a senha e copie manualmente.");
  }
});

$("reset").addEventListener("click", () => {
  rangeEl.value = defaults.length;
  lengthEl.textContent = defaults.length;
  Object.keys(boxes).forEach(key => boxes[key].checked = defaults[key]);
  generatePassword();
});

generatePassword();
