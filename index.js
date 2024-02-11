require("dotenv").config();
const http = require("http");
const fs = require("fs");

// Instead of require, use dynamic import
import('node-fetch').then(({ default: fetch }) => {

  const homeFile = fs.readFileSync("home.html", "utf-8");

  const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
    temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
    temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

    return temperature;
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=Pune&units=metric&appid=${process.env.APPID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      throw error;
    }
  };

  const server = http.createServer(async (req, res) => {
    if (req.url == "/") {
      try {
        const weatherData = await fetchWeatherData();
        const realTimeData = replaceVal(homeFile, weatherData);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(realTimeData);
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write("Internal Server Error");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("File not found");
    }
    res.end();
  });

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });

}).catch(err => {
    console.error('Error importing node-fetch:', err);
});
