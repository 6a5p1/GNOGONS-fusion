const userIdsKey = "user-ids";
const maxInputs = 10;
let inputIds =
  (JSON.parse(localStorage.getItem(userIdsKey)) ||
  [
    //   572, 607, 1340, 3092, 4005, 4646, 5982, 6869, 7128, 7339, 8614, 8868,
  ]).slice(0, maxInputs);
const gnogons = {};

const el = document.createElement("div");
document.body.appendChild(el);

let inputScore;
let list = [];
let lines = [];
let listOfCombinations = [];

const getGnogon = async (decimal) => {
  if (gnogons[decimal]) return gnogons[[decimal]];

  const fullHex = decimal.toString(16).padStart(4, "0");
  const hex = fullHex.startsWith("00") ? fullHex.substr(2) : fullHex;
  const gnogon = JSON.parse(localStorage.getItem(`GNOGONS-73222b-${hex}`));
  if (gnogon)
    return new Promise((resolve) => {
      resolve(gnogon);
    });

  const response = await fetch(
    `https://api.elrond.com/nfts/GNOGONS-73222b-${hex}`
  );
  const json = await response.json();

  json.attributes = atob(json.attributes)
    .split(";")
    .reduce((prev, current) => {
      const [x0, x1] = current.split(":");
      prev[x0] = x1;
      return prev;
    }, {});
  localStorage.setItem(json.identifier, JSON.stringify(json));

  return json;
};

const getPower = (power) => {
  if (power === 96) return power * 1.1;
  if (power === 97) return power * 1.3;
  if (power === 98) return power * 1.5;
  if (power === 99) return power * 1.7;
  if (power === 100) return power * 3;
  return power;
};

const getOther = (value) => {
  if (value === 98) return value * 1.2;
  if (value === 99) return value * 1.5;
  if (value === 100) return value * 2.2;
  return value;
};

const getScore = (obj) => {
  const power = +obj.POWER;
  const attack = +obj.ATTACK;
  const defense = +obj.DEFENSE;
  const speed = +obj.SPEED;
  const intelligence = +obj.INTELLIGENCE;
  const heart = +obj.HEART;

  return (
    getPower(power) +
    getOther(attack) +
    getOther(defense) +
    getOther(speed) +
    getOther(intelligence) +
    getOther(heart)
  );
};

const addScore = (obj) => {
  obj.score = getScore(obj.attributes);
};

const getColor = (value) => {
  if (+value <= 90) return "text-90";
  return `text-${value}`;
};

const combine = (n, lst) => {
  if (!n) return [[]];
  if (!lst.length) return [];
  const x = lst[0];
  const xs = lst.slice(1);
  return combine(n - 1, xs)
    .map((t) => [x].concat(t))
    .concat(combine(n, xs));
};

const unique = (a) =>
  a.filter((b) => {
    b = b.flatMap((x) => x);
    return new Set(b).size === b.length;
  });

const getPairs = (a) => {
  const b = combine(2, a);
  const c = combine((a.length / 2) | 0, b);
  return unique(c);
};

const renderItem = (item, idx) => {
  const { POWER, ATTACK, DEFENSE, SPEED, INTELLIGENCE, HEART } =
    item.attributes;
  const { score, name, url, nonce } = item;
  return `\
    <div class="item">
        <table class="table text-center">
            <thead>
                <tr>
                    <th colspan="2">
                        <div class="${
                          url ? "has-img" : "no-img"
                        } d-flex align-items-center fw-normal">
                            <span class="${
                              url ? "big" : ""
                            } fw-normal">${name}</span>
                            ${
                              url
                                ? `<img src="${url}" width="100%" style="aspect-ratio: 1;" alt="" loading="lazy"><button class="btn-close" data-id="${nonce}"></button>`
                                : `${
                                    idx !== undefined
                                      ? `<span class="idx">${idx + 1}</span>`
                                      : ""
                                  }`
                            }
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p class="mb-0">Power</p>
                        <strong class="big ${getColor(POWER)}">${POWER}</strong>
                    </td>
                    <td>
                        <p class="mb-0">Attack</p>
                        <strong class="big ${getColor(
                          ATTACK
                        )}">${ATTACK}</strong>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="mb-0">Defense</p>
                        <strong class="big ${getColor(
                          DEFENSE
                        )}">${DEFENSE}</strong>
                    </td>
                    <td>
                        <p class="mb-0">Speed</p>
                        <strong class="big ${getColor(SPEED)}">${SPEED}</strong>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="mb-0">Intelligence</p>
                        <strong class="big ${getColor(
                          INTELLIGENCE
                        )}">${INTELLIGENCE}</strong>
                    </td>
                    <td>
                        <p class="mb-0">Heart</p>
                        <strong class="big ${getColor(HEART)}">${HEART}</strong>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2">
                        Score: 
                        <strong class="big">${score}</strong>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
`;
};

const renderInput = () => {
  return `\
        <div class="container mt-3">
            <form class="row g-3 align-items-center w-100">
                <div class="col">
                    <input class="form-control" type="text" placeholder="3456, 1234, 112" id="user-list" value="${inputIds.join(
                      ", "
                    )}">
                </div>
                <div class="col-auto">
                    <button class="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
        <div class="container mt-3">
            <div class="row d-flex gap-0">
                <div class="col">
                  <div class="h-100 bg-dark">
                    <code>
                      <p class="text-light mb-0 px-2 py-2">Function to calculate POWER</p>
                      <pre class="text-warning px-2 py-2 mb-0">${getPower.toString()}</pre>
                    </code>
                  </div>
                </div>
                <div class="col">
                  <div class="h-100 bg-dark">
                    <code>
                      <p class="bg-dark text-light mb-0 px-2 py-2">Function to calculate other attributes</p>
                      <pre class="text-warning px-2 py-2 mb-0">${getOther.toString()}</pre>
                    </code>
                  </div>
                </div>
            </div>
        </div>
        <div class="container mt-3">
            <h5>Input score: ${inputScore}</h5>
            <div class="d-flex flex-nowrap overflow-scroll align-items-center gap-2">
                ${list.map(renderItem).join("")}
            </div>
        </div>
    `;
};

const renderOutput = () => {
  const limit = 8;
  return `\
        <div class="container mt-3">
            <h5>Best SCORE</h5>
            <div class="d-flex flex-nowrap overflow-scroll align-items-center gap-2">
                ${listOfCombinations
                  .sort((a, b) => b.new.score - a.new.score)
                  .filter(
                    (l, i) =>
                      i < limit ||
                      (i >= limit &&
                        +l.new.score === +listOfCombinations[4].new.score)
                  )
                  .map((line, idx) => `${renderItem(line.new, idx)}`)
                  .join("")}
            </div>
        </div>
        <div class="container mt-3">
            <h5>Best POWER</h5>
            <div class="d-flex flex-nowrap overflow-scroll align-items-center gap-2">
                ${listOfCombinations
                  .sort(
                    (a, b) => +b.new.attributes.POWER - a.new.attributes.POWER
                  )
                  .filter(
                    (l, i) =>
                      i < limit ||
                      (i >= limit &&
                        +l.new.attributes.POWER ===
                          +listOfCombinations[4].new.attributes.POWER)
                  )
                  .map((l, idx) => `${renderItem(l.new, idx)}`)
                  .join("")}
            </div>
        </div>
        <hr>
        <div class="container mt-3">
            <h5>Best combination power</h5>
            ${lines
              .sort(
                (a, b) =>
                  b.reduce(
                    (prev, current) => prev + +current.new.attributes.POWER,
                    0
                  ) -
                  a.reduce(
                    (prev, current) => prev + +current.new.attributes.POWER,
                    0
                  )
              )
              .slice(0, 5)
              .map(
                (x) => `\
                <div class="d-flex flex-nowrap overflow-scroll align-items-center gap-2 mb-2">
                    ${x.map((l, idx) => renderItem(l.new, idx)).join("")}
                </div>
            `
              )
              .join("")}
        </div>
        <hr>
        <div class="container mt-3">
            <h5>Best combination score</h5>
            ${lines
              .sort(
                (a, b) =>
                  b.reduce((prev, current) => prev + current.new.score, 0) -
                  a.reduce((prev, current) => prev + current.new.score, 0)
              )
              .slice(0, 5)
              .map(
                (x) => `\
                <div class="d-flex flex-nowrap overflow-scroll align-items-center gap-2 mb-2">
                    ${x.map((l, idx) => renderItem(l.new, idx)).join("")}
                </div>
            `
              )
              .join("")}
        </div>
    `;
};

const render = () => {
  el.innerHTML = `\
    <div class="mb-3">
        ${renderInput()}
        ${renderOutput()}
    </div>`;

  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    inputIds = form
      .querySelector("input")
      .value.split(",")
      .map((x) => +x.trim())
      .slice(0, maxInputs);
    localStorage.setItem(userIdsKey, JSON.stringify(inputIds));
    start();
  });

  document.querySelectorAll(".btn-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nonce = e.currentTarget.dataset.id;
      inputIds = inputIds.filter((i) => i != nonce);
      localStorage.setItem(userIdsKey, JSON.stringify(inputIds));
      start();
    });
  });
};

const generateEveryPossibleCombinations = () => {
  return list.reduce(
    (acc, v, i) =>
      acc.concat(
        list.slice(i + 1).map((w) => ({
          first: v,
          second: w,
        }))
      ),
    []
  );
};

const getComputedAverage = (a, b) =>
  Math.round((3 * Math.max(a, b) + Math.min(a, b)) / 4);

const generateNewGnogon = (combination) => {
  const { first, second } = combination;
  combination.new = {
    name: `${first.name} ${second.name}`,
    attributes: {
      POWER: getComputedAverage(
        first.attributes.POWER,
        second.attributes.POWER
      ),
      ATTACK: getComputedAverage(
        first.attributes.ATTACK,
        second.attributes.ATTACK
      ),
      DEFENSE: getComputedAverage(
        first.attributes.DEFENSE,
        second.attributes.DEFENSE
      ),
      SPEED: getComputedAverage(
        first.attributes.SPEED,
        second.attributes.SPEED
      ),
      INTELLIGENCE: getComputedAverage(
        first.attributes.INTELLIGENCE,
        second.attributes.INTELLIGENCE
      ),
      HEART: getComputedAverage(
        first.attributes.HEART,
        second.attributes.HEART
      ),
    },
  };
  addScore(combination.new);
};

const start = () => {
  Promise.all(inputIds.map(getGnogon)).then((plist) => {
    plist.forEach((gnogon, i) => {
      addScore(gnogon);
      gnogons[inputIds[i]] = gnogon;
    });
    list = plist;

    inputScore = list.reduce((prev, current) => prev + current.score, 0);

    listOfCombinations = generateEveryPossibleCombinations();
    listOfCombinations.forEach(generateNewGnogon);

    lines = getPairs(inputIds).map((line) =>
      line.map((m) => {
        const g = {
          first: gnogons[m[0]],
          second: gnogons[m[1]],
        };
        generateNewGnogon(g);
        return g;
      })
    );

    render();
  });
};

render();
start();
