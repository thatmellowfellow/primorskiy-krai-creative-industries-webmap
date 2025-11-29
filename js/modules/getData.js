//Загружаем JSON-файл конфига карты
export function getData(dir) {
    let res;
    $.ajax({
        url: dir,
        dataType: "json",
        async: false,
        success: function (data) {
            res = data;
        },
    });
    return res;
}
