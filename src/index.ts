import { AmlResolver } from "./resolvers/AmlResolver";
import { FileSystemDeployer } from "./deployers/FileSystemDeployer";
import { NunjucksCompiler } from "./compilers/NunjucksCompiler";
import { Es6Compiler } from "./compilers/Es6Compiler";
import { SassCompiler } from "./compilers/SassCompiler";
import { ProjectFactory } from "./ProjectFactory";
import { ProjectDirector } from "./ProjectDirector";
import { Bit } from "./models/Bit";
import { Block } from "./models/Block";
import { Material } from "./models/Material";
import { Page } from "./models/Page";
import { Project } from "./models/Project";

module.exports = {
  resolvers: {
    AmlResolver
  },
  deployers: {
    FileSystemDeployer
  },
  compilers: {
    NunjucksCompiler,
    Es6Compiler,
    SassCompiler
  },
  models: {
    Bit,
    Block,
    Material,
    Page,
    Project
  },
  ProjectDirector,
  ProjectFactory
};