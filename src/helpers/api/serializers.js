const jsonApiSerializer = require('jsonapi-serializer');

// REFACTOR this whole file!!!
// Is really not DRY :sweat_smile:

module.exports = function serializerHelpers(app) {
  const userAttributes = ['firstName', 'lastName', 'email', 'photo'];

  const sportMinAttributes = ['name'];
  const sportAttributes = ['name', 'logo', 'isIndividual'];

  const playerAttributes = userAttributes.concat(['birthday', 'gender']);
  const playerRelations = ['sports', 'teams', 'matches'];

  const teamAttributes = ['name', 'logo'];
  const teamRelations = ['sport', 'players', 'matches', 'comments'];

  const teamCommentsAttributes = ['content', 'createdAt'];
  const teamCommentsRelations = ['player'];

  const matchAttributes = ['name', 'date', 'isPublic'];
  const matchRelations = ['sport', 'players', 'teams'];

  const compoundOwnerAttributes = userAttributes.concat(['phone']);
  const compoundOwnerRelations = ['compounds'];

  const compoundAttributes = ['name', 'localEmail', 'photo', 'address', 'localPhone'];
  const compoundRelations = ['compoundOwner', 'fields', 'reviews'];

  const fieldAttributes = ['name', 'openingHour', 'closingHour', 'modules', 'photo'];
  const fieldRelations = ['sport', 'compound'];

  const compoundReviewAttributes = ['content', 'createdAt'];
  const compoundReviewRelations = ['player'];

  const includePlayers = function(ctx, options){
    return {
      ref: 'id',
      included: options.includePlayers,
      attributes: playerAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('players'),
      },
      includedLinks: {
        self: (player) => ctx.getFullUrl('player', player.id),
      },
    };
  }
  const includeMatches = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeMatches,
      attributes: matchAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('matches'),
      },
      includedLinks: {
        self: (match) => ctx.getFullUrl('match', match.id),
      },
    };
  }
  const includeTeams = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeTeams,
      attributes: teamAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('teams'),
      },
      includedLinks: {
        self: (team) => ctx.getFullUrl('team', team.id),
      },
    };
  }
  const includeSports = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeSports,
      attributes: sportMinAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('sports'),
      },
      includedLinks: {
        self: (sport) => ctx.getFullUrl('sport', sport.id),
      },
    };
  }
  const includeCompoundOwners = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeCompoundOwners,
      attributes: compoundOwnerAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('compoundOwners'),
      },
      includedLinks: {
        self: (compoundOwner) => ctx.getFullUrl('compoundOwner', compoundOwner.id),
      },
    };
  }
  const includeCompounds = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeCompounds,
      attributes: compoundAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('compounds'),
      },
      includedLinks: {
        self: (compound) => ctx.getFullUrl('compound', compound.id),
      },
    };
  }
  const includeFields = function(ctx, compound, options){
    return {
      ref: 'id',
      included: options.includeFields,
      attributes: fieldAttributes,
      relationshipLinks: {
        related: ctx.getFullUrl('fields'),
      },
      includedLinks: {
        self: (field) => ctx.getFullUrl('field', { id: field.id, compoundId: compound.id }),
      },
    };
  }
  const includeCompoundReviews = function(ctx, options){
    return {
      ref: 'id',
      included: options.includeCompoundReviews,
      attributes: compoundReviewAttributes,
      // relationshipLinks: {
      //   related: ctx.getFullUrl('compoundReviews'),
      // }
    };
  }

  app.context.returnTODO = function(){
    // used for DEBUG
    this.body = { status: 'TODO' };
  }

  app.context.jsonSerializer = function jsonSerializer(type, options) {
    return new jsonApiSerializer.Serializer(type, options);
  };

  // FUTURE:
  // app.context.serializeCollection = function(collection, options){
  //   // options: type, attributes, singularType
  //   return this.jsonSerializer(options.type, {
  //     attributes: options.attributes,
  //     topLevelLinks: {
  //       self: this.getFullUrl(options.type),
  //     },
  //     dataLinks: {
  //       self: (dataset, item) => this.getFullUrl(options.singularType, item.id),
  //     },
  //   }).serialize(collection);
  // }

  app.context.serializeSports = function(sports){
    return this.jsonSerializer('sports', {
      attributes: sportAttributes,
      topLevelLinks: {
        self: this.getFullUrl('sports'),
      },
      dataLinks: {
        self: (dataset, sport) => this.getFullUrl('sport', sport.id),
      },
    }).serialize(sports);
  }

  app.context.serializeSport = function(sport){
    return this.jsonSerializer('sports', {
      attributes: sportAttributes,
      topLevelLinks: {
        self: this.getFullUrl('sport', sport.id),
      },
    }).serialize(sport);
  }


  app.context.serializePlayers = function(players){
    return this.jsonSerializer('players', {
      attributes: playerAttributes,
      topLevelLinks: {
        self: this.getFullUrl('players'),
      },
      dataLinks: {
        self: (dataset, player) => this.getFullUrl('player', player.id),
      },
    }).serialize(players);
  }

  app.context.serializePlayer = function(player, options){
    return this.jsonSerializer('players', {
      attributes: playerAttributes.concat(playerRelations),
      sports: includeSports(this, options),
      teams: includeTeams(this, options),
      matches: includeMatches(this, options),
      topLevelLinks: {
        self: this.getFullUrl('player', player.id),
      },
    }).serialize(player);
  }


  app.context.serializeTeams = function(teams){
    return this.jsonSerializer('teams', {
      attributes: teamAttributes,
      topLevelLinks: {
        self: this.getFullUrl('teams'),
      },
      dataLinks: {
        self: (dataset, team) => this.getFullUrl('team', team.id),
      },
    }).serialize(teams);
  }

  app.context.serializeTeam = function(team, options){
    return this.jsonSerializer('teams', {
      attributes: teamAttributes.concat(teamRelations),
      sport: includeSports(this, { includeSports: true }),
      players: includePlayers(this, options),
      matches: includeMatches(this, options),
      comments: {
        ref: 'id',
        included: options.includeComments,
        attributes: teamCommentsAttributes,
        relationshipLinks: {
          related: this.getFullUrl('teamPublicComments', team.id),
        },
      },
      topLevelLinks: {
        self: this.getFullUrl('team', team.id),
      },
    }).serialize(team);
  }


  app.context.serializeMatches = function(matches){
    return this.jsonSerializer('matches', {
      attributes: matchAttributes,
      topLevelLinks: {
        self: this.getFullUrl('matches'),
      },
      dataLinks: {
        self: (dataset, match) => this.getFullUrl('match', match.id),
      },
    }).serialize(matches);
  }

  app.context.serializeMatch = function(match, options){
    return this.jsonSerializer('matches', {
      attributes: matchAttributes.concat(matchRelations),
      sport: includeSports(this, { includeSports: true }),
      players: includePlayers(this, options),
      teams: includeTeams(this, options),
      topLevelLinks: {
        self: this.getFullUrl('match', match.id),
      },
    }).serialize(match);
  }


  app.context.serializeTeamComments = function(teamComments, team, options){
    const visibility = (options.isPublic) ? 'Public' : 'Private';
    return this.jsonSerializer('teamComments', {
      attributes: teamCommentsAttributes.concat(teamCommentsRelations),
      player: includePlayers(this, options),
      topLevelLinks: {
        self: this.getFullUrl(`team${visibility}Comments`, team.id),
      },
      dataLinks: {
        self: (dataset, comment) => this.getFullUrl(`team${visibility}Comment`, {
          id: comment.id,
          teamId: team.id
        }),
      },
    }).serialize(teamComments);
  }


  app.context.serializeCompoundOwners = function(compoundOwners){
    return this.jsonSerializer('compoundOwners', {
      attributes: compoundOwnerAttributes,
      topLevelLinks: {
        self: this.getFullUrl('compoundOwners'),
      },
      dataLinks: {
        self: (dataset, compoundOwner) => this.getFullUrl('compoundOwner', compoundOwner.id),
      },
    }).serialize(compoundOwners);
  }

  app.context.serializeCompoundOwner = function(compoundOwner, options){
    return this.jsonSerializer('compoundOwners', {
      attributes: compoundOwnerAttributes.concat(compoundOwnerRelations),
      compounds: includeCompounds(this, options),
      topLevelLinks: {
        self: this.getFullUrl('compoundOwner', compoundOwner.id),
      },
    }).serialize(compoundOwner);
  }


  app.context.serializeCompounds = function(compounds){
    return this.jsonSerializer('compounds', {
      attributes: compoundAttributes,
      topLevelLinks: {
        self: this.getFullUrl('compounds'),
      },
      dataLinks: {
        self: (dataset, compound) => this.getFullUrl('compound', compound.id),
      },
    }).serialize(compounds);
  }

  app.context.serializeCompound = function(compound, options){
    return this.jsonSerializer('compounds', {
      attributes: compoundAttributes.concat(compoundRelations),
      compoundOwner: includeCompoundOwners(this, options),
      fields: includeFields(this, compound, options),
      reviews: includeCompoundReviews(this, options),
      topLevelLinks: {
        self: this.getFullUrl('compound', compound.id),
      },
    }).serialize(compound);
  }


  app.context.serializeFields = function(fields){
    return this.jsonSerializer('fields', {
      attributes: fieldAttributes,
      topLevelLinks: {
        self: this.getFullUrl('fields'),
      },
      dataLinks: {
        self: (dataset, field) => this.getFullUrl('field', {
          id: field.id,
          compoundId: field.compound.id
        }),
      },
    }).serialize(fields);
  }

  app.context.serializeField = function(field, options){
    return this.jsonSerializer('fields', {
      attributes: fieldAttributes.concat(fieldRelations),
      sport: includeSports(this, options),
      compound: includeCompounds(this, options),
      topLevelLinks: {
        self: this.getFullUrl('field', {
          id: field.id,
          compoundId: field.compound.id
        }),
      },
    }).serialize(field);
  }


};
