// Импортируем библиотеки
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
//Импортируем функции из модулей
import { styleFeatures } from './js/modules/styleFeatures.js';
import { getData } from './js/modules/getData.js';
import { modifyLayersPanel } from './js/modules/modifyLayersPanel.js';
import mapLegend from './js/modules/mapLegend.js';
import onClassChange from './js/modules/classChangeObserver.js';

//Наведение, клик, деклик на выбранный объект
function highlight(layer) {
    let geomType = layer.feature.geometry.type.toLowerCase();
    //Если полигональный объект
    if (~geomType.indexOf('polygon')) {
        layer.setStyle({
            weight: 4,
        });
    } else if (~geomType.indexOf('point')) {
        layer.setStyle({
            radius: 8,
        });
    }
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function dehighlight(layer, lyrId) {
    if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
        //Не работает при переключении между слоями
        //geoData[lyrId].resetStyle(layer);
        let geomType = layer.feature.geometry.type.toLowerCase();
        //Если полигональный объект
        if (~geomType.indexOf('polygon')) {
            layer.setStyle({
                weight: 2,
            });
        } else if (~geomType.indexOf('point')) {
            layer.setStyle({
                radius: 6,
            });
        }
    }
}
function select(layer, lyrId) {
    if (selected !== null) {
        var previous = selected;
    }
    if (window.innerWidth > 992) {
        map.fitBounds(layer.getBounds(), { paddingBottomRight: [576, 160] });
    } else {
        map.fitBounds(layer.getBounds());
    }
    selected = layer;
    if (previous) {
        dehighlight(previous, lyrId);
    }
}
//По-хорошему надо поменять
let selected = null;

// Загружаем файл конфигурации карты. Переменную делаем глобальной, чтобы она была видна во всех модулях
window.cfg = getData('js/cfg/mapconfig.json');

//Название сайта
document.title = cfg.website_title;

// Подложки в контроль слоёв
let basemaps = {};
for (const [alias, name] of Object.entries(cfg.basemaps)) {
    basemaps[alias] = L.tileLayer.provider(name);
}

// Создаём карту, ставим начальное положение и масштаб, мин. и макс. масштаб, охват; загружаем подложки
// Подложка по умолчанию - первая в списке в файле конфига
let map = L.map('mapid', {
    layers: [basemaps[Object.keys(basemaps)[0]]],
    maxBounds: L.latLngBounds(cfg.extent[0], cfg.extent[1]),
    minZoom: cfg.minZoom,
    maxZoom: cfg.maxZoom,
    zoomControl: false,
    zoomSnap: 0.5,
}).setView(cfg.center, cfg.zoom);

//Кнопки масштаба
L.control
    .zoom({
        position: 'topright',
    })
    .addTo(map);

L.Control.goHome = L.Control.extend({
    onAdd: (map) => {},
});

//Панель слоёв, сразу настраиваем сортировку по порядку в конфиге
let layerControl = L.control
    .layers(basemaps, null, {
        collapsed: false,
        position: 'topleft',
        sortLayers: true,
        sortFunction: (layerA, _, nameA, nameB) => {
            // Если это слой, а не подложка
            if (layerA.urls || layerA._markerCluster) {
                let idxA = cfg.layers.findIndex((el) => el.name == nameA);
                let idxB = cfg.layers.findIndex((el) => el.name == nameB);
                return idxA - idxB;
            } else {
                return 0;
            }
        },
    })
    .addTo(map);

//Масштабная линейка
L.control.scale({ maxWidth: 200, imperial: false }).addTo(map);
//Делаем единицы измерения в масштабной линейке на русском
let scale = document.getElementsByClassName('leaflet-control-scale-line')[0];
scale.textContent = scale.textContent.replace('km', 'км').replace('m', 'м');
['load', 'move', 'zoomend'].forEach((event) => {
    map.on(event, (e) => {
        scale.textContent = scale.textContent
            .replace('km', 'км')
            .replace('m', 'м');
    });
});

//Загружаем geojson-ы и задаём систему условных обозначений
let geoData = [];
let markersClusters = {};
for (let lyrId in cfg.layers) {
    // Используем pane для контроля порядка слоёв
    map.createPane(lyrId);
    if (cfg.layers[lyrId].zIndex) {
        map.getPane(lyrId).style.zIndex = cfg.layers[lyrId].zIndex;
    }
    let pathToLyr = 'sourcedata/mylayers/' + cfg.layers[lyrId].source;
    // Если нужны кластеры маркеров, то инициализируем
    if (cfg.layers[lyrId].markersCluster) {
        markersClusters[lyrId] = L.markerClusterGroup({
            showCoverageOnHover: false,
            disableClusteringAtZoom: 15,
            maxClusterRadius: (zoom) => {
                if (zoom < 8.5) return 27;
                else if (zoom < 11.5) return 33;
                else if (zoom < 14.5) return 39;
                else return 50;
            },
            // iconCreateFunction: (cluster) => {
            //     return L.divIcon({
            //         html: "<b>" + cluster.getChildCount() + "</b>",
            //         className: "marker-cluster",
            //         iconSize: new L.Point(40, 40),
            //     });
            // },
        });
    }
    geoData[lyrId] = new L.GeoJSON.AJAX(pathToLyr, {
        // Стилизация точечного слоя
        pointToLayer: (feature, latlon) => {
            let markerStyle = styleFeatures(feature, cfg.layers[lyrId].style);
            let circleMarker = L.circleMarker(latlon, {
                ...markerStyle,
                pane: lyrId,
            });
            return circleMarker;
        },
        // Стилизация
        style: (feature) => {
            return styleFeatures(feature, cfg.layers[lyrId].style);
        },
        //Настраиваем интерактивность
        onEachFeature: (feature, layer) => {
            // Надпись МО
            if (cfg.layers[lyrId].label) {
                layer.bindTooltip(feature.properties.name, {
                    direction: 'center',
                    className: 'bounds-tooltip',
                });
            }
            // Инфа о лице
            if (cfg.layers[lyrId].tooltip) {
                let toolTipContent = `
                <table class="entity-tooltip table table-hover">
                    <tbody>
                        <tr>
                            <th scope="row">Наименование</th>
                            <td>${feature.properties['Наименование']}</td>
                        </tr>
                        <tr>
                            <th scope="row">ОКВЭД</th>
                            <td>${feature.properties['ОКВЭД']} ${feature.properties['Название категории']}</td>
                        </tr>
                        <tr>
                            <th scope="row">ИНН</th>
                            <td>${feature.properties['ИНН']}</td>
                        </tr>
                    </tbody>
                    </table>`;
                layer.bindPopup(toolTipContent, {
                    // interactive: true,
                    className: 'entity-tooltip',
                });
            }
            layer.on({
                mouseover: (e) => {
                    highlight(e.target);
                    layer.openPopup();
                },
                mouseout: (e) => {
                    dehighlight(e.target, lyrId);
                    layer.closePopup();
                },
            });
        },
        pane: lyrId,
    });
    geoData[lyrId].on('data:loaded', () => {
        if (cfg.layers[lyrId].markersCluster) {
            markersClusters[lyrId].addLayer(geoData[lyrId]);
            // Если имеем кластеры маркеров, добавляем их
            layerControl.addOverlay(
                markersClusters[lyrId],
                cfg.layers[lyrId].name
            );
        } else {
            layerControl.addOverlay(geoData[lyrId], cfg.layers[lyrId].name);
        }
        //Если в конфиге прописано отображения по умолчанию, то отображаем
        if (cfg.layers[lyrId].onByDef) {
            // Если делали кластеры маркеров, то добавляем
            if (cfg.layers[lyrId].markersCluster) {
                map.addLayer(markersClusters[lyrId]);
            } else {
                map.addLayer(geoData[lyrId]);
            }
        }
        //Модифицируем панель слоёв
        modifyLayersPanel();
    });
}
// Легенда
let legend = L.control({ position: 'bottomright' });
legend.onAdd = (map) => mapLegend(map);
legend.addTo(map);

//Всплывающее окно
document.getElementById('v-infobox-closebutton').onclick = () => {
    document
        .getElementsByClassName('v-infobox')[0]
        .classList.remove('v-infobox-open');
};

// Сохранение статуса легенды в localstorage
const legendContainer = document.querySelector('.legend-container');

onClassChange(legendContainer, (_) => {
    localStorage.setItem(
        'isLegendOpen',
        legendContainer.classList.contains('show') ? 1 : 0
    );
});
