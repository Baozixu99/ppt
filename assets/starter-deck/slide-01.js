const slideConfig = Object.freeze({
  type: 'cover',
  title: 'PPTX Generator Smoke Test'
});

function createSlide(pres, theme, helpers) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.18,
    fill: { color: theme.accent },
    line: { color: theme.accent, transparency: 100 }
  });
  slide.addText(slideConfig.title, {
    x: 0.7, y: 1.8, w: 8.6, h: 1.1,
    fontFace: helpers.FONTS.cn, fontSize: 50, bold: true,
    color: theme.primary, align: 'center', valign: 'middle', margin: 0
  });
  slide.addText('Build, inspect, and iterate.', {
    x: 1.2, y: 3.05, w: 7.6, h: 0.55,
    fontFace: helpers.FONTS.en, fontSize: 18,
    color: theme.secondary, align: 'center', margin: 0
  });
  helpers.addSources(slide, ['starter-fixture']);
  return slide;
}

module.exports = { createSlide, slideConfig };
