# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Technologies used:

- Node.js
- Express
- ejs
- Session cookies

## Screenshots

!["URLs index"](https://github.com/sockbot/tinyapp/blob/master/docs/AwesomeScreenshot-localhost-urls-2019-08-08_4_57.png?raw=true)
!["Edit a short URL"](https://github.com/sockbot/tinyapp/blob/master/docs/AwesomeScreenshot-localhost-urls-I0J7As-2019-08-08_4_58.png?raw=true)

## How it works

A user with an account can create and edit short URLs that redirect to other URLs on the internet.

Users are able to store the shortened URLs in their library. Only the owner of a URL library can view their library, but each shortened URL can be shared publicly.

User passwords are salted and hashed using bcrypt. Encrypted cookies are set on the browser client in order to have login persistence between views.

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command. The app will be available at http://localhost:8080.

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session