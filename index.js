const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage
const fs = require('fs')
const firstline = require('firstline')
require('dotenv').config()

// AddMovie scene
const addMovie = new Scene('addmovie');
addMovie.enter((ctx) => ctx.reply('¿Qué película deseas agregar?'));
addMovie.leave((ctx) => ctx.reply('Arre'));
addMovie.hears('Listo', leave());
addMovie.hears('listo', leave());
addMovie.on('message', (ctx) => addMovieToList(ctx));

// RemoveMovie scene
const removemovie = new Scene('removemovie');
removemovie.enter((ctx) => ctx.reply('¿Qué película quieres quitar?'));
removemovie.leave((ctx) => ctx.reply('Arre'));
removemovie.hears('Listo', leave());
removemovie.hears('listo', leave());
removemovie.on('message', (ctx) => removeMovieFromList(ctx));

// ClearAll scene
const clearall = new Scene('clearall');
clearall.enter((ctx) => ctx.reply('¿Segurx que quieres borrar todo? (Si/No)'));
clearall.leave((ctx) => ctx.reply('Todo bien.'));
clearall.hears('No', leave());
clearall.hears('Si', (ctx) => deleteEverything(ctx));
clearall.hears('Listo', leave());
clearall.hears('listo', leave());

// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());

// Scene registration
stage.register(addMovie);
stage.register(removemovie);
stage.register(clearall);

const bot = new Telegraf(process.env.BOT_TOKEN);
const instrucciones = `Soy el Pelisolobot y voy a manejar tu lista de películas
 \nEscribe '/addmovie' para agregar a la lista
 \nEscribe '/removemovie'/removemovie para quitar de la lista
 \nEscribe '/viewall' para ver toda la lista
 \nEscribe '/clearall' para borrar toda la lista
 \nEscribe 'cual sigue?' para ver tu siguiente película en la lista
 \nSi no te contesto es que no entendí el comando, fíjate que esté igual a como dije
 \nTambién pido perdón`
bot.use(session())
bot.use(stage.middleware())
bot.command('addmovie', (ctx) => ctx.scene.enter('addmovie'));
bot.command('removemovie', (ctx) => ctx.scene.enter('removemovie'));
bot.command('clearall', (ctx) => ctx.scene.enter('clearall'));
bot.command('viewall', (ctx) => displayAllMovies(ctx));
bot.startPolling();
bot.start((ctx) => ctx.reply(instrucciones));
bot.on('text', (ctx) => ctx.reply(`No entendí qué dijiste... \n ${instrucciones}`));
bot.on('sticker', (ctx) => ctx.reply('Gran sticker amix'));
bot.hears('pideme perdon', (ctx) => ctx.reply('Perdón :('));
bot.hears('pídeme perdón', (ctx) => ctx.reply('Perdón :('));
bot.hears('Pídeme perdón', (ctx) => ctx.reply('Perdón :('));
bot.hears('Pideme perdon', (ctx) => ctx.reply('Perdón :('));
bot.hears('cual sigue?', (ctx) => nextMovie(ctx));
bot.hears('Cual sigue?', (ctx) => nextMovie(ctx));
bot.launch();

function displayAllMovies(ctx) {
  const data = fs.readFileSync('peliculas.txt', 'utf-8');
  if(!data.toString()) {
    ctx.reply('La lista está vacía')
  } else {
    ctx.reply(data.toString());
  }
}

function nextMovie(ctx) {
  firstline('./peliculas.txt').then((val) => ctx.reply(val));
}

async function addMovieToList(ctx) {
  const movieName = ctx.message.text;
  try {
    fs.appendFile('peliculas.txt', `\n${movieName}`, function (err) {
      if (err) return console.log(err);
    });
    await ctx.reply(`Se ha agregado ${movieName} a la cola \nEscribe otro nombre para agregar otra pelícua o 'listo' para terminar`);
  } catch (err) {
    console.log(err)
  }
}

async function removeMovieFromList(ctx) {
  const movieName = ctx.message.text;
  try {
    var data = fs.readFileSync('peliculas.txt', 'utf-8');
    var newValue = data.replace(new RegExp(movieName), '');
    fs.writeFileSync('peliculas.txt', newValue, 'utf-8');
    await ctx.reply(`Se quito ${movieName} de la cola \nEscribe otro nombre para agregar otra pelícua o 'listo' para terminar`);
  } catch (err) {
    console.log(err)
  }
}

async function deleteEverything(ctx) {
  fs.writeFileSync('peliculas.txt', '');
  await ctx.reply('Todo se borró como pediste');
}
