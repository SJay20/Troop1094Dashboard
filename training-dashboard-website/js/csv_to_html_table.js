var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];
                var $tableHeadRow = $("<tr></tr>");
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    $tableHeadRow.append($('<th class="sortable"></th>').text(csvHeaderRow[headerIdx]));
                }
                $tableHead.append($tableHeadRow);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $("<tr></tr>");
                    for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        if(colIdx == 0){
                            const todaysDate = new Date();
                            const twoMonthsDate = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth() + 2, 
                                new Date().getDate()
                            );
                            let [year, month, day] = csvData[rowIdx][1].split('/');
                            const expiryDate = new Date(+year+2, +month - 1, +day);

                            console.log(csvData[rowIdx][1]);

                            if(expiryDate < todaysDate){
                                var $tableBodyRow = $('<tr style="background-color: #FFEBEB;"></tr>');
                                var $tableBodyRowTd = $('<td style="background-color: #FF5E5E;">!!!</td>');
                                $tableBodyRow.append($tableBodyRowTd);
                                $tableBody.append($tableBodyRow);
                            } else if(expiryDate < twoMonthsDate){
                                var $tableBodyRow = $('<tr style="background-color: #FFF9E3;"></tr>');
                                var $tableBodyRowTd = $('<td style="background-color: #FFDE6A;">?</td>');
                                $tableBodyRow.append($tableBodyRowTd);
                                $tableBody.append($tableBodyRow);
                            } else{
                                var $tableBodyRow = $('<tr style="background-color: #E7FFEC;"></tr>');
                                var $tableBodyRowTd = $('<td style="background-color: #64DE50;">✓</td>');
                                $tableBodyRow.append($tableBodyRowTd);
                                $tableBody.append($tableBodyRow);
                            }
                        }
                    
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];
                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);
                    }
                }
                $table.append($tableBody);

                $table.DataTable(datatables_options);

                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};