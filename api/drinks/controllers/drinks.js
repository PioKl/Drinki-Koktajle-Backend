'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    //Dodanie Owner Policy w celu zabezpieczenia przed edytowaniem i usunięciem drinków, które nie należą do danego użytkownika
    //https://strapi.io/documentation/developer-docs/latest/guides/is-owner.html#apply-the-author-by-default

    //Połączenie użytkownika z danym drinkiem (z drinkiem, który stworzył i należy do niego)
    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);
        data.user = ctx.state.user.id;
        entity = await strapi.services.drinks.create(data, { files });
        } else {
        ctx.request.body.user = ctx.state.user.id;
        entity = await strapi.services.drinks.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.drinks });
    },

    //Aktualizacja drinka należącego tylko do użytkownika, który stworzył dany drink
    async update(ctx) {
        const { id } = ctx.params;
    
        let entity;
    
        const [drinks] = await strapi.services.drinks.find({
          id: ctx.params.id,
          'user.id': ctx.state.user.id,
        });
    
        if (!drinks) {
          return ctx.unauthorized(`You can't update this entry`);
        }
    
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.drinks.update({ id }, data, {
            files,
          });
        } else {
          entity = await strapi.services.drinks.update({ id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.drinks });
      },

      //Usunięcie drinka należącego tylko do użytkownika, który go stworzył

      async delete(ctx) {
        const { id } = ctx.params;
    
        let entity;
    
        const [drinks] = await strapi.services.drinks.find({
          id: ctx.params.id,
          'user.id': ctx.state.user.id,
        });
    
        if (!drinks) {
          return ctx.unauthorized(`You can't update this entry`);
        }
    
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.drinks.update({ id }, data, {
            files,
          });
        } else {
          entity = await strapi.services.drinks.update({ id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.drinks });
      },

    //Koniec Owner Policy

    //Pobranie zalogowanych użytkowników
    async me(ctx) {
        const user = ctx.state.user //pobranie użytkownika (będzie wymagany do tego token)

        //Jeśli nie ma takiego użytkownika, czyli token nie będzie się w przyszłości zgadzał
        if(!user) {
            return ctx.badRequest(null, [
                {messages: [{id: "No authorization header was found"}]},
            ]);
        }

        //tutaj będą znajdowały się wszystkie drinki jakie zalogowany użytkownik posiada
        const data = await strapi.services.drinks.find({user: user.id})

        //jeśli nie znalazło drinków, które ma użytkownik
        if(!data) {
            return ctx.notFound();
        }
        //zwrócenie tych danych
        return sanitizeEntity(data, {model: strapi.models.drinks});

    },
};
