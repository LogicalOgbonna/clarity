import Scrapper from '../common/scrapper';

const main = async (): Promise<void> => {
  const elements = await Scrapper.findElement();
  console.log('🚀 ~ privacy:', elements?.privacy);
  console.log('🚀 ~ terms:', elements?.terms);
};

main();

export {};
