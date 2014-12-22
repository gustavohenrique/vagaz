#coding: utf-8
import requests
import bs4
import json
import io


INICIAIS = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
BASE_URL = 'http://www.vagas.com.br'


class Vagas(object):

    def _listar_vagas(self, url):
        response = requests.get('%s%s' % (BASE_URL, url))
        soup = bs4.BeautifulSoup(response.text)
        vagas = []
        for article in soup.select('section#lista-vagas-de-empresas article'):
            h2 = article.select('header h2.cargo')[0]
            a = h2.select('a.link-detalhes-vaga')[0]
            span = h2.select('span[itemprop="addressLocality"]')
            local = ''
            if span:
                local = span[0].get_text()
            vaga = {
                'titulo': a.attrs.get('title'),
                'url': a.attrs.get('href'),
                'local': local
            }
            vagas.append(vaga)

        pagination = soup.select('div.pagination a.next_page')
        if pagination:
            url = pagination[0].attrs.get('href')
            vagas += self._listar_vagas(url)

        return vagas


    def listar(self):
        empresas = []
        for inicial in INICIAIS:
            response = requests.get('%s/empresas?l=%s' % (BASE_URL, inicial))
            soup = bs4.BeautifulSoup(response.text)

            for li in soup.select('ul#listaClientes li'):
                a = li.select('a')[0];
                url = a.attrs.get('href')
                imagem_url = ''
                img = a.select('img')
                if img:
                    imagem_url = img[0].attrs.get('src')
                vagas = self._listar_vagas(url)



                empresa = {
                    'nome': a.attrs.get('title'),
                    'url': url,
                    'imagem': imagem_url,
                    'vagas': vagas,
                    'totalVagas': len(vagas)
                }
                empresas.append(empresa)

        return empresas


if __name__ == '__main__':
    resultado = Vagas().listar()
    with io.open('vagas.json', 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(resultado, ensure_ascii=False)))
        # f.write(unicode(json.dumps(resultado, ensure_ascii=False, indent=4)))



