Ecwid.OnAPILoaded.add(() => {
  Ecwid.API.get('products', {
    limit: 1,
    includeFields: 'id,name,options,attributes,brand,created'
  }, res => console.log(res.items[0]));
});
