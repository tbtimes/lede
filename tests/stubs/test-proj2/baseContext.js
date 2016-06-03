export default class NunjucksDefaultBaseContext {
  public seo: Object = {
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        content: 'IE=edge',
        props: [
          {
            prop: 'http-equiv',
            val: 'X-UA-Compatible'
          }
        ],
      },
      {
        props: [
          {
            prop: 'charset',
            val: 'UTF-8'
          }
        ],
      },
      {
        name: 'description',
        content: 'Starter lede project',
      },
    ],
    title: "Default lede project"
  };
  public inheritancePaths: Array<string> = [];
  public custom: Object = {};
  public debug: boolean = true;

  constructor(){};
}