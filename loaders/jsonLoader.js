export function jsonLoader(source) {
  console.log(source, "jsonLoader-------------");
  this.addDeps(source)
  return `export default ${JSON.stringify(source)}`;
}
