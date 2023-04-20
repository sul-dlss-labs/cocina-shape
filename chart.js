async function main() {

  const layout = {
    margin: {l: 0, r: 0, b: 0, t: 0},
    height: 900,
  };

  const config = {
    displaylogo: false,
    displayModeBar: false
  };

  const dataAll = await getData('data-all.csv');
  Plotly.newPlot('chart-all', dataAll, layout, config);

  const dataCatalog = await getData('data-catalog.csv');
  Plotly.newPlot('chart-catalog', dataCatalog, layout, config);
}

async function getData(csvUrl) {

  const csv = await d3.csv(csvUrl);

  const ids = [];
  const labels = [];
  const parents = [];
  const values = [];

  for (const node of getNodes(csv)) {
    ids.push(node.id);
    labels.push(node.label);
    parents.push(node.parent);
    values.push(node.count);
  }

  const data = [{
    type: "sunburst",
    ids: ids,
    labels: labels,
    parents: parents,
    values: values,
    outsidetextfont: {size: 20, color: "#377eb8"},
    leaf: {opacity: 0.4},
    marker: {line: {width: 1}},
    maxdepth: 3,
    branchvalues: 'total'
  }];

  return data;
}

/**
 * getNodes does the hard work of converting the JSON paths with 
 * terminal string or number values into a list of "nodes" 
 * which represent the hierarchy of parts of those JSON paths.
 * Each node contains an id, a label, a count, and the id of its parent.
 */

function getNodes(csv) {
  const nodes = new Map();
  csv.forEach(row => {

    // each parent's count gets incremented by the count of its children
    // so we steph through each element in the JSON path and generate
    // objects for larger and larger JSON paths that are included in the 
    // full JSON path, starting at the root.
    
    const idParts = row.path.split(".");
    for (let i = 1; i <= idParts.length; i += 1) {
      const count = Number.parseInt(row.count);
      const id = getId(idParts, i);
      const label = id.split(".").pop();
      const parentId = getId(idParts, i - 1);

      const node = nodes.get(id) || {
        id: id,
        parent: parentId,
        label: label,
        count: 0
      };

      node.count += count;
      nodes.set(id, node);
    }
  })
  return nodes.values();
}

function getId(parts, i) {
  return parts.slice(0, i).join('.').replace(/\[\]/g, '');
}

window.addEventListener("load", main);
