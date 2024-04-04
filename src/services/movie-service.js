export default class MovieService {
  // мой ключ авторизации
  apiKey = '14787f1283170aa3d528383f25e83472';

  // Опции запроса
  options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  };

  //Базовый URL
  baseUrl = 'https://api.themoviedb.org/3';

  //Основной запрос на получение списка фильмов
  async getResource(searchText, page = 1) {
    const response = await fetch(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${searchText}&page=${page}`,
      this.options
    );
    if (!response.ok) {
      throw new Error(`could not featch, received ${response.status}`);
    }
    return await response.json();
  }

  //Создание гостевой сессии
  async createGuestSession() {
    const response = await fetch(
      `${this.baseUrl}/authentication/guest_session/new?api_key=${this.apiKey}`,
      this.options
    );

    if (!response.ok) {
      throw new Error(`could not featch, received ${response.status}`);
    }
    return await response.json();
  }

  //Функция добавления рейтинга POST запрос
  async addRating(movieId, rating, sessionId) {
    const ratingUrl = `${this.baseUrl}/movie/${movieId}/rating?api_key=${this.apiKey}&guest_session_id=${sessionId}`;

    const response = await fetch(ratingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      redirect: 'follow',
      body: JSON.stringify({ value: rating }),
    });

    if (!response.ok) {
      throw new Error(`could not featch, received ${response.status}`);
    }

    return await response.json();
  }

  //Получение оцененных фильмов
  async getRatedMovies(sessionId, page = 1) {
    const response = await fetch(
      `${this.baseUrl}/guest_session/${sessionId}/rated/movies?api_key=${this.apiKey}&language=en-US&page=${page}`,
      this.options
    );
    if (!response.ok) {
      throw new Error(`could not featch, received ${response.status}`);
    }
    return await response.json();
  }

  //Получение списка Жанров
  async getGenres() {
    const genresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.apiKey}`;
    const response = await fetch(genresUrl, this.options);

    if (!response.ok) {
      throw new Error(`could not featch, received ${response.status}`);
    }

    const result = await response.json();
    return result;
  }
}
