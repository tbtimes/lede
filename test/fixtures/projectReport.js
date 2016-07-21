let resolve = require('path').resolve;

let projectReport = {
  workingDirectory: __dirname,
  context: {
    seo: {
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
    },
    content: {
      ARTICLE: [
        {tmpl: 'proj3/text', text: 'hello'},
        {tmpl: 'proj3/text', text: 'cruel'},
        {tmpl: 'proj3/text', text: 'world'},
      ]
    }
  },
  dependencies: [
    {
      workingDir: resolve(__dirname, "projects", "proj5"),
      name: 'proj5',
      dependsOn: [],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "projects")
    },
    {
      workingDir: resolve(__dirname, "projects", "proj3"),
      name: 'proj3',
      dependsOn: ['proj5'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "projects")
    },
    {
      workingDir: resolve(__dirname, "projects", "proj4"),
      name: 'proj4',
      dependsOn: ['proj3', 'proj5'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "projects")
    },
    {
      workingDir: resolve(__dirname, "projects", "proj2"),
      name: 'proj2',
      dependsOn: ['proj4'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "projects")
    },
    {
      workingDir: resolve(__dirname, "projects", "proj1"),
      name: 'proj1',
      dependsOn: ['proj2'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "projects")
    },
  ],
  styles: [],
  scripts: ["proj5/globalScript.js"],
  blocks: ['proj4/baz.html', 'ARTICLE']
};

module.exports = projectReport;