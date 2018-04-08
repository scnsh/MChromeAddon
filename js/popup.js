$(function(){

    //'use strict';
    var $calendar = $('#calendar');
    var weekTbl = new Array('月','火','水','木','金','土','日');	// 曜日テーブル定義
    var monthTbl= new Array(31,28,31,30,31,30,31,31,30,31,30,31);	// 月テーブル定義
    var curDate = new Date();
    var curToday = curDate.getDate();	// 今日の'日'を退避
    var todayCurMonth = curDate.getMonth();	// 月を取得(0月～11月)
    var curYear = curDate.getFullYear();	// 年を取得        

    var ids = '';    //読み込んだオフィス名に対応するidを取得
    var names = '';  //読み込んだオフィス名の文字列を取得
    var colors = ''; //読み込んだ色の文字列を取得

    var myWeek;
    var myTblLine;
    var pukiwikiTable;

    //リストは2個以上が必要、0:休日用デフォルト、1:平日用デフォルト
    $.getJSON("js/list.json", function(data){
        for(var i in data)
        {
            ids += data[i].id + ',';
            names += data[i].name + ',';
            colors += data[i].color + ',';
        }

        // JSONファイルを読み込んでから実行する、今月分のみ表示
        setCalender(curYear, todayCurMonth);        
    });
    
    //pukiwikiフォーマットの日付を出力する
    function getDayPrint(colorList, day)
    {
        if(day == '')
            return '';

        var id = $("[id=list" + day +  "]").val();
        return "&color(" + colorList[id] + ",white){" + day +"};";
    }

    //pukiwiki用のフォーマットを出力する
    function getPukiwiki(tblLine, table)
    {
        var colorList = colors.split(",");
        var nameList = names.split(",");
        var txt = '';
        for(var i=0; i < nameList.length - 1; i++)
        {
            txt += "- &color(" + colorList[i] + ",white){" + colorList[i] + " : " + nameList[i] + "};\n"   
        }
        txt += "|月|火|水|木|金|土|日|\n";

        var source = '';
        var td = '|';
        var tdC = '|';
        var tr = '|';
        var trC = '\n';
    
        for(i=0; i<tblLine; i++){	// 表の「行」のループ
            source += tr;
            for (var j = 0; j < 7; j++) {
                var dat = table[j+(i*7)];
                source += getDayPrint(colorList, dat) + tdC;
            }
            source += trC;
        }
        txt += source;
        return txt;
    }

    //プルダウンメニューを作成
    function getPulldown(table, day, myWeek)
    {
        var txt = '<select id="list' + (day + 1) + '">';
        var nameList = names.split(",");
        var idList = ids.split(",");
        var index = day+myWeek;

        var selector = new Array();
        if(index%7 == 5 || index%7 == 6)
        {
            selector.push(' selected');
            selector.push('');
        }else{
            selector.push('');
            selector.push(' selected');
        }
        
        txt += '<option value="' + 
               idList[0] + '"' + 
               selector[0] + '>' + 
               nameList[0] + '</option>';
        txt += '<option value="' + 
               idList[1] + '"' + 
               selector[1] + '>' + 
               nameList[1] + '</option>';
        for(var i = 2; i < nameList.length; i++)
        {
            txt += '<option value="' + 
            idList[i] + '">' + 
            nameList[i] + '</option>';         
        }
        txt += '</select>';    

        return txt;           
    }

    // カレンダーを作成
    function setCalender(y, m){
        var myDate = new Date(y,m);	// 今日の日付データ取得
        var myYear = myDate.getFullYear();	// 年を取得
        ((myYear % 4)===0 && (myYear % 100) !==0) || (myYear % 400)===0 ? monthTbl[1] = 29: 28;	// うるう年だったら2月を29日とする
        var myMonth = myDate.getMonth();	// 月を取得(0月～11月)
        myDate.setDate(1);	// 日付を'1日'に変えて、
        myWeek = myDate.getDay() == 0 ? 6 : myData.getDay() -1;	// '１日'の曜日を取得(0:月 -> 6:日)
        myTblLine = (myWeek < 0 && monthTbl[myMonth] > 29) ? 6 : Math.ceil((myWeek+monthTbl[myMonth])/7);	// カレンダーの行数, 日曜から始まり30日以上ある月のみ6行
        var myTable = new Array(7*myTblLine);	// 表のセル数を用意
        pukiwikiTable = new Array(7*myTblLine);	// 表のセル数を用意        
        for(var i=0; i<7*myTblLine; i++){
            myTable[i]=' ';	// セルを全て空にする
            pukiwikiTable[i]='';
        }
        for(i=0; i<monthTbl[myMonth]; i++){
            myTable[i+myWeek]=(i+1) + getPulldown(myTable, i, myWeek);	// 日付を埋め込む
            pukiwikiTable[i+myWeek]=(i+1);
        }
    
        var source = '';
        var td = '<td>';
        var tdC = '</td>';
        var tr = '<tr>';
        var trC = '</tr>';
    
        for(i=0; i<myTblLine; i++){	// 表の「行」のループ
            source += tr;
            for (var j = 0; j < 7; j++) {
                var mydat = myTable[j+(i*7)];
                if(todayCurMonth === myMonth && mydat === curToday){
                    source += '<td class="today">' + mydat + tdC;
                }else if(j === 5){
                    source += '<td class="sat">' + mydat + tdC;
                }else if(j === 6){
                    source += '<td class="sun">' + mydat + tdC;
                }else{
                    source += td + mydat + tdC;
                }
            }
            source += trC;
        }
        var week = '';
        for(var k=0; k<7; k++){	// 曜日
            if(k === 5){
                week += '<td class="sat">' + weekTbl[k] + tdC;
            }else if(k === 6){
                week += '<td class="sun">' + weekTbl[k] + tdC;
            }else{
                week += td + weekTbl[k] + tdC;
            }
        }
        var weekTr = tr + week + trC;
        var tableSource = '<table>' +
            '<tr><td colspan="7">' +
            myYear + '年' + (myMonth+1) + '月' +
            '</td></tr>' + weekTr + source + '</table>';
        
        $calendar.append(tableSource);	// 表の作成開始
    }

    //クリック時に呼ばれる
    $("#generate").on("click", function(){
                
        // var d = new Date();
        // var firstday = new Date(d.getFullYear()+"/"+(d.getMonth() + 1) + "/01").getDay();

        // var weekdays = ["日", "月", "火", "木", "金", "土", "日"];

        // $("#text").text("曜日:" + weekdays[firstday]);
        //$("#text").text($("#list15 option:selected").text());
        $("#text").text(getPukiwiki(myTblLine, pukiwikiTable));

    });    

  }); 