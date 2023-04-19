async function main() {
  const data = await getData();

  const layout = {
    margin: {l: 0, r: 0, b: 0, t: 0},
    height: 900,
  };

  const config = {
    displaylogo: false,
    displayModeBar: false
  };

  Plotly.newPlot('chart', data, layout, config);
}

async function getData() {

  const csv = await d3.csv('data.csv');
  const nodes = getNodes(csv);

  const ids = [];
  const labels = [];
  const parents = [];
  const values = [];

  for (const node of nodes) {
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
    branchvalues: 'total',
    hoverinfo: 'none',
  }];

  return data;
}

function getNodes(csv) {
  const nodes = new Map();
  csv.forEach(row => {
    const idParts = row.path.split(".");
    for (let i = 1; i <= idParts.length; i += 1) {
      const count = Number.parseInt(row.count);
      const id = getId(idParts, i);
      const label = id.split(".").pop();
      const parentId = getId(idParts, i - 1);

      const node = nodes.get(id) || {id: id, parent: parentId, label: label, count: 0};
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
