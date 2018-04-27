$(function(){

    var defaults = {
        ids: [0, 1],
        names: ["休み", "オフィスA"],
        colors: ["black", "red"]
    };

    var $place_list = $('#place_list');
    
    //テキストに変更
    function getColorName(color)
    {
        switch(color)
        {
            case 'black':
                return '黒';
            case 'red':
                return '赤'
            case 'green':
                return '緑'
            case 'blue':
                return '青'
            case 'yellow':
                return '黄'
        }
        return '黒'        
    }

    //テーブルの更新
    function updateTable(){
        //ストレージから読み込む(defaultsの構造で読み込む、なければdefaultsの値がそのまま読まれる)
        chrome.storage.local.get(defaults, function(items) {

            var source = '';
            var td = '<td>';
            var tdC = '</td>';
            var tr = '<tr>';
            var trC = '</tr>';        
                
            for(i=0; i<items.ids.length; i++)
            {
                source += tr;
                //ID追加
                source += td + items.ids[i] + tdC;
                //場所名追加
                source += td + items.names[i] + tdC;
                //色追加
                source += td + getColorName(items.colors[i]) + tdC;
                source += trC;
            }                

            var tableSource = '<table border="1">' + 
            '<tr><td>ID</td><td>場所名</td><td>色</td>' +
            source + '</table>';

            //リストを更新
            $place_list.empty();            
            $place_list.append(tableSource);            
        });        
    }

    //起動時に読み込まれる
    $(document).ready( function(){
        updateTable();
    });    
        
  // 追加ボタンが押されたら、ストレージに保存する
  $("#add").click(function(){

    //ストレージから読み込む(defaultsの構造で読み込む、なければdefaultsの値がそのまま読まれる)
    chrome.storage.local.get(defaults, function(items)
    {
        var name = $("#add_name").val();
        var color = $('#add_color').val();
    
        //リストを更新(末尾に追加)
        items.ids.push(items.ids.length > 0 ? items.ids[items.ids.length - 1]+1 : 0);
        items.names.push(name);
        items.colors.push(color);
    
        //ストレージに永続化する
        chrome.storage.local.set(items, function(){});    
    });
  });

  // 削除ボタンが押されたら、ストレージに保存する
  $("#del").click(function(){
    //ストレージから読み込む(defaultsの構造で読み込む、なければdefaultsの値がそのまま読まれる)
    chrome.storage.local.get(defaults, function(items)
    {
        var id = parseInt($("#del_id").val());
        if(id == NaN || id >= items.ids.length || id < 0)
            return;
        items.ids.pop();//末尾を削除
        items.names.splice(id, 1); //対応アイテムを削除
        items.colors.splice(id, 1);//対応アイテムを削除
            
        //ストレージに永続化する
        chrome.storage.local.set(items, function(){});    
    });
  });

  // 変更があったときに呼ばれる
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace == "local") {
        updateTable();
    }
  });  

});