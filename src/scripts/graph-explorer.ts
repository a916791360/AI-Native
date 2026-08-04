import type { Core, EventObject, NodeSingular } from 'cytoscape';

import {
  computeGraphPositions,
  createSyntheticGraph,
  RELATION_TYPES,
  type GraphData,
  type GraphNode,
  type GraphRelationType,
} from '@/lib/graph/model';

const relationLabels: Record<GraphRelationType, string> = {
  prerequisite: '前置',
  component: '组成',
  comparison: '比较',
  application: '应用',
};

function cssColor(name: string): string {
  const source = cssValue(name);
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.fillStyle = source;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${red}, ${green}, ${blue}, ${(alpha ?? 255) / 255})`;
}

function cssValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function graphElements(graph: GraphData, benchmark = false) {
  return [
    ...graph.nodes.map((node) => ({
      data: { ...node },
      position: node.position,
    })),
    ...graph.edges.map((edge) => ({
      data: {
        ...edge,
        typeLabel: benchmark ? '' : relationLabels[edge.type],
      },
    })),
  ];
}

function replaceFocusOptions(root: HTMLElement, nodes: GraphNode[]): void {
  const select = root.querySelector<HTMLSelectElement>('[data-graph-focus-select]');
  if (!select) return;
  select.replaceChildren(
    ...nodes.map((node) => {
      const option = document.createElement('option');
      option.value = node.id;
      option.textContent = node.label;
      return option;
    }),
  );
}

function renderDetails(root: HTMLElement, graph: GraphData, node: GraphNode): void {
  const title = root.querySelector<HTMLElement>('[data-graph-detail-title]');
  const titleEn = root.querySelector<HTMLElement>('[data-graph-detail-en]');
  const summary = root.querySelector<HTMLElement>('[data-graph-detail-summary]');
  const link = root.querySelector<HTMLAnchorElement>('[data-graph-detail-link]');
  const list = root.querySelector<HTMLUListElement>('[data-graph-detail-relations]');
  if (!title || !titleEn || !summary || !link || !list) return;

  title.textContent = node.label;
  titleEn.textContent = node.labelEn;
  summary.textContent = node.summary;
  link.href = node.url;
  link.hidden = node.url === '#';
  list.replaceChildren();

  graph.edges
    .filter((edge) => edge.source === node.id || edge.target === node.id)
    .slice(0, 4)
    .forEach((edge) => {
      const neighborId = edge.source === node.id ? edge.target : edge.source;
      const neighbor = graph.nodes.find((item) => item.id === neighborId);
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${relationLabels[edge.type]} · ${neighbor?.label ?? neighborId}`;
      item.append(label, document.createTextNode(edge.explanation));
      list.append(item);
    });
}

function selectedTypes(root: HTMLElement): GraphRelationType[] {
  return [...root.querySelectorAll<HTMLInputElement>('[data-graph-relation]:checked')]
    .map((input) => input.value)
    .filter((value): value is GraphRelationType =>
      RELATION_TYPES.includes(value as GraphRelationType),
    );
}

function applyFilters(root: HTMLElement, cy: Core, updateState = true): void {
  const domain = root.querySelector<HTMLSelectElement>('[data-graph-domain]')?.value ?? '';
  const types = new Set(selectedTypes(root));
  const activeTypeCount = types.size;

  cy.batch(() => {
    cy.nodes().forEach((node) => {
      const visible = !domain || node.data('domain') === domain;
      node.style('display', visible ? 'element' : 'none');
    });
    cy.edges().forEach((edge) => {
      const endpointsVisible =
        edge.source().style('display') !== 'none' && edge.target().style('display') !== 'none';
      const visible = endpointsVisible && types.has(edge.data('type') as GraphRelationType);
      edge.style('display', visible ? 'element' : 'none');
    });
    if (activeTypeCount < RELATION_TYPES.length) {
      cy.nodes(':visible').forEach((node) => {
        const hasVisibleEdge = node
          .connectedEdges()
          .some((edge) => edge.style('display') !== 'none');
        if (!hasVisibleEdge) node.style('display', 'none');
      });
    }
  });

  root.dataset.graphVisibleNodes = String(cy.nodes(':visible').length);
  root.dataset.graphVisibleEdges = String(cy.edges(':visible').length);
  const status = root.querySelector<HTMLElement>('[data-graph-status] span');
  const isEmpty = cy.nodes(':visible').length === 0;
  if (updateState) root.dataset.graphState = isEmpty ? 'empty' : 'ready';
  if (status && isEmpty) status.textContent = '当前筛选没有可显示的词条关系';
}

function setZoom(root: HTMLElement, cy: Core, nextZoom: number): void {
  cy.zoom({
    level: Math.min(cy.maxZoom(), Math.max(cy.minZoom(), nextZoom)),
    renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
  });
  root.dataset.graphZoom = cy.zoom().toFixed(2);
}

function focusNode(
  root: HTMLElement,
  cy: Core,
  graph: GraphData,
  nodeId: string,
  reducedMotion: boolean,
  moveViewport = true,
): void {
  const element = cy.$id(nodeId);
  const node = graph.nodes.find((item) => item.id === nodeId);
  if (!element.length || !node || element.style('display') === 'none') return;

  const visibleEdges = element.connectedEdges(':visible');
  const visibleNodes = visibleEdges.connectedNodes().union(element);
  const neighborhood = visibleNodes.union(visibleEdges);
  const positions = computeGraphPositions(
    visibleNodes.map((item) => ({ id: item.id() })),
    visibleEdges.map((edge) => ({ source: edge.source().id(), target: edge.target().id() })),
  );

  cy.batch(() => {
    cy.elements().unselect().removeClass('is-outside-focus');
    cy.elements(':visible').difference(neighborhood).addClass('is-outside-focus');
    visibleNodes.forEach((item) => {
      const position = positions[item.id()];
      if (position) item.position(position);
    });
    element.select();
  });
  if (moveViewport) {
    if (reducedMotion) cy.fit(neighborhood, 85);
    else cy.animate({ fit: { eles: neighborhood, padding: 85 }, duration: 280 });
  }
  renderDetails(root, graph, node);
  const select = root.querySelector<HTMLSelectElement>('[data-graph-focus-select]');
  if (select) select.value = nodeId;
  root.dataset.graphSelected = nodeId;
}

async function initializeGraph(root: HTMLElement): Promise<void> {
  if (root.dataset.graphState === 'loading' || root.dataset.graphState === 'ready') return;
  const canvas = root.querySelector<HTMLElement>('[data-graph-canvas]');
  const status = root.querySelector<HTMLElement>('[data-graph-status] span');
  const data = root.querySelector<HTMLScriptElement>('[data-graph-data]');
  if (!canvas || !status || !data) return;

  root.dataset.graphState = 'loading';
  canvas.ariaBusy = 'true';
  status.textContent = '正在建立关系场';
  const startedAt = performance.now();

  try {
    if (new URLSearchParams(window.location.search).has('graphError')) {
      throw new Error('Forced graph failure');
    }
    const benchmark =
      root.dataset.graphMode === 'full' &&
      new URLSearchParams(window.location.search).get('benchmark') === '500';
    const graph = benchmark
      ? createSyntheticGraph()
      : (JSON.parse(data.textContent ?? '') as GraphData);
    if (benchmark) replaceFocusOptions(root, graph.nodes);
    const { default: cytoscape } = await import('cytoscape');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cy = cytoscape({
      container: canvas,
      elements: graphElements(graph, benchmark),
      layout: { name: 'preset', fit: true, padding: 90 },
      minZoom: 0.25,
      maxZoom: 2.6,
      wheelSensitivity: 0.18,
      pixelRatio: benchmark ? 1 : 'auto',
      style: [
        {
          selector: 'node',
          style: {
            width: benchmark ? 10 : 66,
            height: benchmark ? 10 : 66,
            'background-color': cssColor('--color-black'),
            'border-width': benchmark ? 1 : 1.4,
            'border-color': cssColor('--color-muted'),
            label: benchmark ? '' : 'data(label)',
            color: cssColor('--color-ink'),
            'font-size': 11,
            'font-family': cssValue('--font-body'),
            'min-zoomed-font-size': 9,
            'text-wrap': 'wrap',
            'text-max-width': '92px',
            'text-valign': 'bottom',
            'text-margin-y': 10,
          },
        },
        {
          selector: 'node:selected',
          style: {
            width: benchmark ? 17 : 82,
            height: benchmark ? 17 : 82,
            'background-color': cssColor('--color-ink'),
            'border-color': cssColor('--color-prerequisite'),
            color: cssColor('--color-black'),
            'font-size': 12,
          },
        },
        {
          selector: '.is-outside-focus',
          style: {
            opacity: benchmark ? 1 : 0.035,
            'text-opacity': 0,
            events: 'no',
          },
        },
        {
          selector: 'edge',
          style: {
            width: benchmark ? 0.65 : 1.25,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'arrow-scale': benchmark ? 0.45 : 0.7,
            label: 'data(typeLabel)',
            'font-size': 8,
            'min-zoomed-font-size': 8,
            color: cssColor('--color-quiet'),
            'text-rotation': 'autorotate',
            'text-background-color': cssColor('--color-black'),
            'text-background-opacity': 0.92,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge[type="prerequisite"]',
          style: {
            'line-color': cssColor('--color-prerequisite'),
            'target-arrow-color': cssColor('--color-prerequisite'),
          },
        },
        {
          selector: 'edge[type="component"]',
          style: {
            'line-color': cssColor('--color-component'),
            'target-arrow-color': cssColor('--color-component'),
            'line-style': 'dashed',
          },
        },
        {
          selector: 'edge[type="comparison"]',
          style: {
            'line-color': cssColor('--color-comparison'),
            'target-arrow-color': cssColor('--color-comparison'),
            'line-style': 'dotted',
            'source-arrow-shape': 'triangle',
            'source-arrow-color': cssColor('--color-comparison'),
          },
        },
        {
          selector: 'edge[type="application"]',
          style: {
            'line-color': cssColor('--color-application'),
            'target-arrow-color': cssColor('--color-application'),
            'line-style': 'dashed',
          },
        },
      ],
    });

    root.querySelectorAll<HTMLButtonElement>('[data-graph-action]').forEach((button) => {
      button.disabled = false;
      button.addEventListener('click', () => {
        if (button.dataset.graphAction === 'zoom-in') setZoom(root, cy, cy.zoom() * 1.2);
        if (button.dataset.graphAction === 'zoom-out') setZoom(root, cy, cy.zoom() / 1.2);
        if (button.dataset.graphAction === 'reset') {
          const selected = cy.nodes(':selected').first();
          if (selected.length) focusNode(root, cy, graph, selected.id(), reducedMotion);
          else cy.fit(cy.elements(':visible'), 60);
          root.dataset.graphZoom = cy.zoom().toFixed(2);
        }
      });
    });
    root.querySelectorAll<HTMLInputElement>('[data-graph-relation]').forEach((input) =>
      input.addEventListener('change', () => {
        applyFilters(root, cy);
        const selected = cy.nodes(':selected:visible').first();
        const target = selected.length ? selected : cy.nodes(':visible').first();
        if (target.length) focusNode(root, cy, graph, target.id(), true);
      }),
    );
    root.querySelector<HTMLSelectElement>('[data-graph-domain]')?.addEventListener('change', () => {
      applyFilters(root, cy);
      const selected = cy.nodes(':selected:visible').first();
      const target = selected.length ? selected : cy.nodes(':visible').first();
      if (target.length) focusNode(root, cy, graph, target.id(), true);
    });
    root
      .querySelector<HTMLSelectElement>('[data-graph-focus-select]')
      ?.addEventListener('change', (event) => {
        const nodeId = (event.currentTarget as HTMLSelectElement).value;
        const domain = root.querySelector<HTMLSelectElement>('[data-graph-domain]');
        if (domain?.value && cy.$id(nodeId).style('display') === 'none') {
          domain.value = '';
          applyFilters(root, cy);
        }
        focusNode(root, cy, graph, nodeId, reducedMotion);
      });
    cy.on('tap', 'node', (event: EventObject) => {
      focusNode(root, cy, graph, (event.target as NodeSingular).id(), reducedMotion);
    });
    cy.on('zoom', () => (root.dataset.graphZoom = cy.zoom().toFixed(2)));
    canvas.addEventListener('keydown', (event) => {
      const panStep = 36;
      if (event.key === 'ArrowLeft') cy.panBy({ x: panStep, y: 0 });
      else if (event.key === 'ArrowRight') cy.panBy({ x: -panStep, y: 0 });
      else if (event.key === 'ArrowUp') cy.panBy({ x: 0, y: panStep });
      else if (event.key === 'ArrowDown') cy.panBy({ x: 0, y: -panStep });
      else if (event.key === '+' || event.key === '=') setZoom(root, cy, cy.zoom() * 1.2);
      else if (event.key === '-') setZoom(root, cy, cy.zoom() / 1.2);
      else if (event.key === 'Home') {
        const selected = cy.nodes(':selected').first();
        if (selected.length) focusNode(root, cy, graph, selected.id(), true);
        else cy.fit(cy.elements(':visible'), 60);
      } else return;
      event.preventDefault();
    });

    applyFilters(root, cy, false);
    cy.fit(cy.elements(':visible'), 110);
    root.dataset.graphNodeCount = String(graph.nodes.length);
    root.dataset.graphEdgeCount = String(graph.edges.length);
    root.dataset.graphInitMs = (performance.now() - startedAt).toFixed(1);
    root.dataset.graphZoom = cy.zoom().toFixed(2);
    canvas.ariaBusy = 'false';
    const queryFocus = new URLSearchParams(window.location.search).get('focus');
    const initialFocus = benchmark ? graph.nodes[0]?.id : queryFocus || root.dataset.graphFocus;
    if (initialFocus) focusNode(root, cy, graph, initialFocus, true);
    root.dataset.graphState = 'ready';
  } catch {
    root.dataset.graphState = 'error';
    canvas.ariaBusy = 'false';
    status.textContent = '交互图谱暂不可用，请继续浏览下方文字关系';
  }
}

function prepareGraph(root: HTMLElement): void {
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const loadButton = root.querySelector<HTMLButtonElement>('[data-graph-load]');
  loadButton?.addEventListener('click', () => {
    root.classList.add('is-active');
    void initializeGraph(root);
  });

  if (isMobile) return;
  if (!('IntersectionObserver' in window)) {
    void initializeGraph(root);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void initializeGraph(root);
    },
    { rootMargin: '180px' },
  );
  observer.observe(root);
}

document.querySelectorAll<HTMLElement>('[data-graph-explorer]').forEach(prepareGraph);
