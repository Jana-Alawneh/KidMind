import axios from "axios";


const api = axios.create({

  baseURL:
    "http://localhost:5000",

  headers: {

    "Content-Type":
      "application/json",

  },

});


api.interceptors.request.use(

  (config) => {

    const token =
      sessionStorage.getItem(
        "kidmind_token"
      );


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;

  },

  (error) => {

    return Promise.reject(
      error
    );

  }

);


api.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    if (
      error.response?.status ===
      401
    ) {

      sessionStorage.removeItem(
        "kidmind_token"
      );

      sessionStorage.removeItem(
        "kidmind_user"
      );

    }


    return Promise.reject(
      error
    );

  }

);


export default api;