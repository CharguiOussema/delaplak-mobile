// Structural data for the Accueil screen — display strings live in i18n
// locale files (home.* keys), consistent with the rest of this app's i18n
// convention. Metro requires static require() paths, so each image is
// listed explicitly rather than built from a template string.

export type Decor = {
  slug: string;
  titleKey: string;
  image: number;
};

export const heroImage = require('../../assets/images/decors/prestige-walnut.jpg');

export const decors: Decor[] = [
  { slug: 'prestige-walnut', titleKey: 'home.decors.prestigeWalnut', image: require('../../assets/images/decors/prestige-walnut.jpg') },
  { slug: 'mocha-wood', titleKey: 'home.decors.mochaWood', image: require('../../assets/images/decors/mocha-wood.jpg') },
  { slug: 'sereno-oak', titleKey: 'home.decors.serenoOak', image: require('../../assets/images/decors/sereno-oak.jpg') },
  { slug: 'chene-vanillia', titleKey: 'home.decors.cheneVanillia', image: require('../../assets/images/decors/chene-vanillia.jpg') },
  { slug: 'gris-moineau', titleKey: 'home.decors.grisMoineau', image: require('../../assets/images/decors/gris-moineau.jpg') },
  { slug: 'japandi', titleKey: 'home.decors.japandi', image: require('../../assets/images/decors/japandi.jpg') },
];

export const strengthKeys = [
  'home.strengths.quality',
  'home.strengths.design',
  'home.strengths.durability',
  'home.strengths.service',
];
