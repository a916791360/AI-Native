function initializeAtlas(root: HTMLElement): void {
  const sectionsRoot = root.querySelector<HTMLElement>('[data-atlas-sections]');
  const controls = document.querySelector<HTMLElement>('[data-atlas-controls]');
  const ringSelect = controls?.querySelector<HTMLSelectElement>('[data-atlas-ring]');
  const sortSelect = controls?.querySelector<HTMLSelectElement>('[data-atlas-sort]');
  const visibleOutput = controls?.querySelector<HTMLElement>('[data-atlas-visible]');
  if (!sectionsRoot || !ringSelect || !sortSelect || !visibleOutput) return;

  const sectionsContainer = sectionsRoot;
  const ringControl = ringSelect;
  const sortControl = sortSelect;
  const visibleCount = visibleOutput;
  const sections = [...sectionsContainer.querySelectorAll<HTMLElement>('[data-atlas-domain]')];
  const params = new URLSearchParams(window.location.search);
  ringControl.value = params.get('ring') ?? 'all';
  sortControl.value = params.get('sort') ?? 'domain';

  function update(): void {
    const ring = ringControl.value;
    const sort = sortControl.value;
    const sorted = [...sections].sort((left, right) => {
      const key = sort === 'name' ? 'name' : sort === 'priority' ? 'priority' : 'order';
      if (key === 'name')
        return (left.dataset.name ?? '').localeCompare(right.dataset.name ?? '', 'zh-CN');
      return Number(left.dataset[key]) - Number(right.dataset[key]);
    });

    let visibleTerms = 0;
    sorted.forEach((section) => {
      section.hidden = ring !== 'all' && section.dataset.ring !== ring;
      if (!section.hidden) visibleTerms += Number(section.dataset.termCount ?? 0);
      sectionsContainer.append(section);
    });
    visibleCount.textContent = String(visibleTerms);

    const nextParams = new URLSearchParams(window.location.search);
    if (ring === 'all') nextParams.delete('ring');
    else nextParams.set('ring', ring);
    if (sort === 'domain') nextParams.delete('sort');
    else nextParams.set('sort', sort);
    const query = nextParams.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );
  }

  ringControl.addEventListener('change', update);
  sortControl.addEventListener('change', update);
  update();
}

document.querySelectorAll<HTMLElement>('[data-atlas-index]').forEach(initializeAtlas);
