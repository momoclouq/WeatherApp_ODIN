let apiKey = "161a913ba7b97a7c0311eb378b4277b3";
let gifKey = "V3VqNjMweAkgZvnQHpxFjjF9I3s0heCP";

let asyncFactory = (() => {
    async function getWeather(city){
        try{
            let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            let jsonResult = await response.json();
            return jsonResult;
        } catch (err){
            console.log(err);
        }
    }
    
    let processData = async (raw) => {
        if (!raw) return {};
        
        let output = {};
        output.name = raw.name;
        output.temp_max = raw.main.temp_max;
        output.temp_min = raw.main.temp_min;
        output.typeOfWeather = [];
    
        let promises = raw.weather.map((value) => {
            output.typeOfWeather.push(value.main + "-" + value.description);
            return fetch(`https://api.giphy.com/v1/gifs/search?api_key=${gifKey}&q=${value.description}`).then( response => response.json());
        });

        let finalImagesRaw = await Promise.all(promises);
        output.imgLink = finalImagesRaw[0].data[0].images.downsized.url;
    
        return output;
    };

    let search = async (location) => {
        let raw = await getWeather(location);
        let processed = await processData(raw);

        return processed;
    }

    return {
        search
    }
})();

let domManager = (() => {
    let createDiv = (data) => {
        let newDiv = document.createElement("div");
        newDiv.textContent = data;
        return newDiv;
    }

    let createImg = (link) => {
        let newImg = document.createElement("img");
        newImg.alt = "some picture";
        newImg.src = link;

        return newImg;
    }

    let updateResult = (newResult) => {
        let weatherPanel = document.querySelector("#weatherPanel");
        weatherPanel.textContent = "";
        weatherPanel.appendChild(createDiv(newResult.name));
        weatherPanel.appendChild(createDiv(newResult.temp_max));
        weatherPanel.appendChild(createDiv(newResult.temp_min));
        newResult.typeOfWeather.forEach((type) => {
            weatherPanel.appendChild(createDiv(type));
        });
        weatherPanel.appendChild(createImg(newResult.imgLink));
    };  

    let initialize = () => {
        let weatherPanel = document.querySelector("#weatherPanel");
        asyncFactory.search("london")
        .then((processedData) => {
            updateResult(processedData);
        })
        .catch(function(err){
            weatherPanel.textContent = err;
        });
    
        

        let searchBtn = document.querySelector("#searchLo");
        let locationInput = document.querySelector("#location");
        searchBtn.addEventListener("click", async function(){
            let location = locationInput.value;
            let result = await asyncFactory.search(location);
            updateResult(result);
        });
    };

    return {
        initialize
    }
})();

domManager.initialize();

