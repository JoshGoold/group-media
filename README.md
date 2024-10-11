<<<<<<< HEAD
# Header 1
    
=======
# Group Media
### Designed to be a Reddit clone with a twist.
My Goal of the project was to create strict communities where people can find and join communities of people who are similar to them

# Technologies used

## Vite React
```
  npm create vite@latest
```

## Tailwind Css
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

```

## Express && Express session
```
npm i express express-session
```
## Utilized MongoDB for scalalibity and ease of use
```
npm i mongoose
```
### Example Connection
```
  mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("DATABASE INITIALIZED");
    //Start node js server after database connects
    app.listen(process.env.SERVER_PORT, () => {
      console.log(`SERVER STARTED ON PORT: ${process.env.SERVER_PORT}`);
    });
  })
  .catch((e) => {
    console.log("DATABASE FAILURE: ", e.message);
  });
```
# Containerized with docker

>>>>>>> 381634639dbed26b16ed4283e6058773eef33de8
