export function scrollToElement(element, options = {}) {
  if (!element) return;

  const { behavior = "smooth", block = "start", inline = "nearest" } = options;

  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior, block, inline });
  });
}
