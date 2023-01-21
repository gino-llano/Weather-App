const form = document.querySelector(".top-banner form");
const list = document.querySelector('.ajax-section .cities');
const apiKey = "6b9594a356e9292197f08fea399e534c";

function removeCity(content)
{
  const cities = document.querySelectorAll('.city');
  for (let i=0; i<cities.length; i++) 
    if (cities[i].innerHTML === content)
    {
      list.removeChild(cities[i])
      break;
    }
}

function insertCity(data)
{
  if (data.message === "city not found")
  {
    form.querySelector('.msg').textContent = "Please search for a valid city 😩";
    form.reset();
    form.querySelector('input').focus();
    return
  }
  const { main, name, sys, weather } = data;
  const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
    weather[0]["icon"]
  }.svg`;
  const li = document.createElement("li");
  li.classList.add("city");
  const markup = ` 
  <h2 class="city-name" data-name="${name},${sys.country}"> 
  <span>${name}</span> 
  <sup>${sys.country}</sup> 
  </h2> 
  <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> 
  </div> 
  <figure> 
  <img class="city-icon" src=${icon} alt=${weather[0]["main"]}> 
  <figcaption>${weather[0]["description"]}</figcaption> 
  </figure>
  <button class='remove-btn'><i class="bi bi-x-circle"></i></button> 
  `;
  li.innerHTML = markup;
  list.appendChild(li);
  li.querySelector('.remove-btn').addEventListener('click', () => removeCity(li.innerHTML));
  form.reset();
  form.querySelector('input').focus();
}
function searchCity(url)
{
  fetch(url)
  .then(response => response.json())
  .then(data => {
    insertCity(data);
  })
  .catch(error => console.log(error))
}
const successCallback = (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  searchCity(url);
};
const errorCallback = (error) => {
  console.log(error);
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

form.addEventListener("submit", submitCity);

function submitCity(e)
{
  e.preventDefault();

  let inputVal = form.querySelector('input').value;
  form.querySelector('.msg').textContent = '';

  const listItems = list.querySelectorAll(".ajax-section .city");
  const listItemsArray = Array.from(listItems);
  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter(el => {
      let content = "";
      //athens,gr 
      if (inputVal.includes(",")) {
        //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal 
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el.querySelector(".city-name span").textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        //athens 
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });
    if (filteredArray.length > 0) {
      form.querySelector('.msg').textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well 😉`;
      form.reset();
      form.querySelector('input').focus();
      return;
    }
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  searchCity(url);
}

const sortDown = document.getElementById('sort-down');
sortDown.addEventListener('click', () => sortCities((a, b) => {
  const tempA = a.querySelector('.city-temp').innerText
  const tempB = b.querySelector('.city-temp').innerText
  return Number(tempA.replace('°C', '')) - Number(tempB.replace('°C', ''));
}))

const sortUp = document.getElementById('sort-up');
sortUp.addEventListener('click', () => sortCities((a, b) => {
  const tempA = a.querySelector('.city-temp').innerText;
  const tempB = b.querySelector('.city-temp').innerText;
  return Number(tempB.replace('°C', '')) - Number(tempA.replace('°C', ''));
}))

function swapCities(a, b)
{
  a.querySelector('.remove-btn').removeEventListener('click', removeCity)
  b.querySelector('.remove-btn').removeEventListener('click', removeCity)
  const aux = a.innerHTML;
  a.innerHTML = b.innerHTML;
  b.innerHTML = aux;
  a.querySelector('.remove-btn').addEventListener('click', () => removeCity(a.innerHTML))
  b.querySelector('.remove-btn').addEventListener('click', () => removeCity(b.innerHTML))
}
function sortCities(comparison)
{
  const cities = Array.from(document.querySelectorAll('.city'));
  sortCitiesRec(cities, comparison, 0, cities.length - 1);
} 
function sortCitiesRec(cities, comparison, left, right)
{
  if (left >= right)
    return
  swapCities(cities[left], cities[Math.floor((left + right) / 2)]);
  
  let limit = left;
  for (let i=left+1; i<=right; i++)
    if (comparison(cities[i], cities[left]) < 0)
      swapCities(cities[i], cities[++limit]);
    
  swapCities(cities[left], cities[limit])
  sortCitiesRec(cities, comparison, left, limit - 1);
  sortCitiesRec(cities, comparison, limit + 1, right);
}
