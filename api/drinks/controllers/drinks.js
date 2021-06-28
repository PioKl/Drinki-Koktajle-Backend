'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
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
