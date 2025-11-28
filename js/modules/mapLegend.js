export default function mapLegend(_) {
    // Отрасли КИ и их цвета
    const industryColors = {
        'Арт-индустрия': '#FFE699',
        'Исполнительское искусство': '#FFE699',
        'Кино, телевизионные программы и фильмы': '#73FB79',
        'Медиа и СМИ': '#00FB92',
        Музыка: '#00FA00',
        Образование: '#7030A0',
        НИОКР: '#7030A0',
        'Реклама и пиар': '#FF8AD8',
        Видеоигры: '#73FEFF',
        'Программное обеспечение': '#73FEFF',
        'Архитектура и урбанистика': '#92D050',
        Дизайн: '#92D050',
        'Книжное дело': '#D883FF',
        Мода: '#FF3FFF',
        'Народно-художественные промыслы и ремесла': '#FFC000',
        Культтовары: '#FFC000',
        Гастрономия: '#FFC000',
        'Культурное наследие': '#00B0F0',
        'Отдых и развлечения': '#7A81FF',
        'Производство оборудования и материалов для креативных индустрий':
            '#F8CBAD',
        'Тиражирование товаров креативных индустрий': '#F8CBAD',
        'Распространение товаров и услуг креативных индустрий': '#F8CBAD',
        'Обслуживание креативных индустрий': '#F8CBAD',
    };

    let div = L.DomUtil.create('div', 'info legend');

    let legendContents = '';
    for (const [cat, color] of Object.entries(industryColors)) {
        legendContents += `
            <div>
                <i style="background: ${color}"></i>
                <span>${cat}</span>
            </div>
        `;
    }
    div.innerHTML = `
    <i title="Условные обозначения" class="legend-close-btn btn btn-light btn-sm fa-solid fa-angle-down" data-bs-toggle="collapse" data-bs-target="#collapseLegend" aria-expanded="true"></i>
    <div class="legend-container collapse ${localStorage.getItem('isLegendOpen') == '1' ? 'show' : ''}" id="collapseLegend">
        <div style="justify-content: space-between">
            <h6 class="legend-header">Предприятия креативных индустрий</h6>
        </div>
        ${legendContents}
    </div>`;
    return div;
}
