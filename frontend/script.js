document.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => window.print());

  // Smooth scroll for TOC links
  document.querySelectorAll('.toc a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null, '', `#${id}`);
    });
  });

  // Highlight active TOC entry
  const sections = document.querySelectorAll('article.terms section[id]');
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.toc a[href="#${id}"]`);
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, {root:null,rootMargin:'-20% 0px -60% 0px',threshold:0});

  sections.forEach(s => obs.observe(s));
});
