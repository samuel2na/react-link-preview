import React, { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const getPreviewData = (tags) => {
  //reduce - 1° parm é uma function e o 2° é o acumulador
  const result = tags.reduce((previewData, item) => {
    switch(item.tag){
      case 'og:title':
        previewData.title = item.value;
        break;
      case 'og:url':
        previewData.link = item.value;
        break;
      case 'og:description':
        previewData.description = item.value;
        break;
      case 'og:site_name':
        previewData.site = item.value;
        break;
      case 'og:image':
        previewData.image = item.value;
        break;
      default:
        break;
    }
    return previewData;
  }, {});

  return Promise.resolve(result);
}
//cheerio - permite usar dentro do js as tags do html como seletores
const parseHTML = (html) => {
  const $ = cheerio.load(html);

  const meta = [];
  $('head meta').map((i, item) => {
    if(!item.attribs) return null;
    
    const property = item.attribs.property || null;
    const content = item.attribs.content || null;
    
    if(!property || !content) return null;
    meta.push({ tag: property, value: content });
    return null;
  });

  // retorna uma promisse para ser usado no then da function fecthUrl
  return Promise.resolve(meta);
}

const fetchUrl = (url) => {
   return axios(CORS_PROXY + url)
    .then(response => response.data);
}

const getURL = (text) => {
  if(!text) return null;

  const a = document.createElement('a');
  a.href = text;

  const { protocol, host, pathname, search, hash } = a;

  const url = `${protocol}//${host}${pathname}${search}${hash}`;
  
  //validando se o link é o mesmo host que estou 
  const isSameHost =  (host === window.location.host)
  if(isSameHost) return null;

  return url;

};

function App() {

  const [previewData, setPreviewData] = useState(null);


  function onBlur(e){
    const url = getURL(e.target.value); 
    if(!url) return null;
    fetchUrl(url)
      .then(parseHTML)
      .then(getPreviewData)
      .then(setPreviewData)
      .then(console.log)
      .catch(console.error);
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-8">
          <h4>Project React Link Preview</h4>
          <div className="form-group">
            <label>Digite o link para buscar as informações</label>
            <input type="text" placeholder="url" className="form-control" onBlur={onBlur} />
          </div>
        </div>
      </div>
      {previewData && (
        <div className="row">
          <div className="card col-8 pt-4">
            <img className="card-img-top" src={previewData.image} width="250" alt={previewData.title} />
            <div className="card-body">
              <small>{"Site: " + previewData.site}</small>
              <h5 className="card-title">{previewData.title}</h5>
              <p>{previewData.description}</p>
              <a href={previewData.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Leia Mais...</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
