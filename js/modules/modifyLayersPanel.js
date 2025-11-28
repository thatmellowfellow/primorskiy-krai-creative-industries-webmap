// import onClassChange from "./classChangeObserver.js";

export function modifyLayersPanel() {
    let layersContainer = document.querySelector('.leaflet-top.leaflet-left');
    layersContainer.classList.add('leaflet-control-layers-container');
    // if (localStorage.getItem("isLayersPanelOpen") == "1") layersContainer.classList.add("leaflet-control-layers-container-visible");
    let layersList = document.getElementsByClassName(
        'leaflet-control-layers-list'
    )[0];
    let basemapsGroup = document.getElementsByClassName(
        'leaflet-control-layers-base'
    )[0];
    let overlaysGroup = document.getElementsByClassName(
        'leaflet-control-layers-overlays'
    )[0];
    let layersSep = document.getElementsByClassName(
        'leaflet-control-layers-separator'
    )[0];

    //Делаем подписи
    let layersPanelHeaderHTML =
        "<div class='leaflet-control-layers-header-container'><img src='./sourcedata/logos/coa.png' class='leaflet-control-layers-header-icon'/><h4 class='leaflet-control-layers-header'>Креативные индустрии<br/>Приморского края</h4><button type='button' aria-label='Закрыть' id='layers-panel-close-button' class='leaflet-control-layers-header-closebutton leaflet-control-layers-header-closebutton-flipped btn btn-light btn-sm'><i class=\"fa-solid fa-xmark\"></button></div>";
    basemapsGroup.insertAdjacentHTML(
        'afterbegin',
        '<h6>Картографическая основа</h6>'
    );
    overlaysGroup.insertAdjacentHTML('afterbegin', layersPanelHeaderHTML);

    //Добавляем полосу прокрутки
    layersList.classList.add('leaflet-control-layers-scrollbar');

    //Меняем порядок слоёв в окне
    layersList.insertBefore(overlaysGroup, basemapsGroup);
    layersList.insertBefore(layersSep, basemapsGroup);

    //Добавляем функционал кнопке открытия
    let layersPanelOpenBtn = document.getElementById(
        'layers-panel-open-button'
    );
    layersPanelOpenBtn.onclick = (e) => {
        layersContainer.classList.add(
            'leaflet-control-layers-container-visible'
        );
    };

    //Добавляем функционал кнопке закрытия
    let layersPanelCloseBtn = document.getElementById(
        'layers-panel-close-button'
    );
    layersPanelCloseBtn.onclick = (e) => {
        layersContainer.classList.remove(
            'leaflet-control-layers-container-visible'
        );
    };

    //Все спэны-слои
    let children = overlaysGroup.querySelectorAll(
        'span:has(input.leaflet-control-layers-selector)'
    );

    for (let span of children) {
        //Добавляем bootstrap-стиль для чекбоксов
        span.classList.add('form-check', 'form-switch');
        let checkbox = span.getElementsByTagName('input')[0];
        checkbox.classList.add('form-check-input');
        checkbox.setAttribute('role', 'switch');
    }

    // Сохранение статуса панели слоёв в localstorage
    // onClassChange(layersContainer, (_) => {
    //     localStorage.setItem(
    //         "isLayersPanelOpen",
    //         layersContainer.classList.contains("leaflet-control-layers-container-visible") ? 1 : 0
    //     );
    // });
}
