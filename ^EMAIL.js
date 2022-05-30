/**
 * ^EMAIL.js 1.0 2007/01/10
 * by (por): Carlos E. Mendoza S., 01/28/2003
 * Copyright (c) 2003-&up INGENIX Consulting-VE.  All rights reserved.
 *
 * INGENIX 21 grants you a royalty free license to use or modify this
 * software provided that this copyright notice appears on all copies.
 * This software is provided "AS IS," without a warranty of any kind.
 *
 * INGENIX 21 le otorga una licencia gratuita para usar y/o modificar
 * este software siempre que mantenga este COPYRIGHT en todas las copias.
 * Este software es entregado "COMO ESTA", sin ningun tipo de garantia.
 */

var AUTHON      = {};
var SCHEMEON    = '';
var VALIDURL    = '';
var OAUTHURL    = '';
var SCOPE       = '';
var CLIENTID    = '';
var REDIRECT    = '';
var TYPE        = '';
var APP_PROMT   = '';
var LOGIN_HINT  = '';
var STATE       = '';
var OldObj      = '';
var AID         = '';
var BID         = '';
var MID         = '';
var curr_AID    = '';
var curr_BID    = '';
var curr_MID    = '';
var TMPswd      = {};
var eMails      = '';
var btn_scroll  = 0;
var refresh_AID = false;
var refresh_BID = false;
var xSilent     = {};

var KNOWSERVER = {
  gmail: {
   OUT_going: {
      protocol : "SMTP", Host : "smtp.gmail.com", Port : 587,
      Encryp   : "STARTTLS",
      Auth     : "PLAIN",
    },
    
    IN_going: {
//    protocol : "POP3", Host :  "pop.gmail.com", Port : 995,
      protocol : "IMAP", Host : "imap.gmail.com", Port : 993,
      Encryp   : "SSL",
      Auth     : "PLAIN",
    },
    Encryp_scheme: "OPENSSL",
    Auth_scheme  : "GOOGLE",
  },
  hotmail: {
   OUT_going: {
      protocol : "SMTP", Host : "smtp-mail.outlook.com", Port : 587,
      Encryp   : "SSL",
      Auth     : "LOGIN",
    },
    IN_going: {
//    protocol : "POP3", Host :  "pop-mail.outlook.com", Port : 995,
      protocol : "IMAP", Host : "imap-mail.outlook.com", Port : 993,
      Encryp   : "SSL",
      Auth     : "LOGIN",
    },
    Encryp_scheme: "OPENSSL",
    Auth_scheme  : "HOTMAIL",
  },
  yahoo: {
   OUT_going: {
      protocol : "SMTP", Host : "smtp.mail.yahoo.com", Port : 465,
      Encryp   : "SSL",
      Auth     : "PLAIN",
    },
    IN_going: {
//    protocol : "POP3", Host :  "pop.mail.yahoo.com", Port : 995,
      protocol : "IMAP", Host : "imap.mail.yahoo.com", Port : 993,
      Encryp   : "SSL",
      Auth     : "PLAIN",
    },
    Encryp_scheme: "OPENSSL",
    Auth_scheme  : "YAHOO",
  }
};
var accountTemplate = {
  "account"     : {},
  "last_upDate" : 0,
  "messages"    : 0,
  "size"        : 0,
  "unseen"      : 0,
  "recent"      : 0,
  "folders"     : [],
//  "data"        : [],//*** Eliminar
  "sortBy"      : "Date",
  "reverse"     : true,
};

function My_onLoad() {
  btn_scroll  = {};

  document.addEventListener("scroll",function(evt) {
    evt = evt || event;
    evt.preventDefault();
    evt.stopPropagation();

    setTimeout(function() { // requerido por la transicion entre paginas
      var z = $(window).scrollTop() + $(window).height();
      if ( z < btn_scroll[ CurrentPage[0].id ] ) {
        btn_scroll[ CurrentPage[0].id ] -= 1;
        return false
      };
      btn_scroll[ CurrentPage[0].id ] = z;
      if ( btn_scroll[ CurrentPage[0].id ] > $(document).height() - $(window).height() * 3 ) {
        if ( CurrentPage[0].id == "EMAIL_List" ) {
                 AID = localStorage.getItem( 'CurrentAccount' ) || "",
                 BID = localStorage.getItem( 'CurrentMailBox' ) || "",
                 MID = localStorage.getItem( 'CurrentMessage' ) || "",

              eMails = JSON.parse(localStorage.getItem('eMails')) || {};
          var eMail  = eMails[ AID ].folders[ BID ];

          var _Message = eMail.messages - eMail.data.length;
          if ( _Message > 0 )
            MAIL_CMD( "IN", "LIST_MAIL", "0 "+ ( 10 + _Message ) +"\" Mail_BOX=\""+ eMail[ "pathName" ], Get_MailLst, false );
        };
      };
    }, 500);
  });
}
function My_submit( button, preview ) {
  if ( CurrentPage && CurrentPage[0].id == "EMAIL_Edit_Mail" ) {
    MAIL_Pswd = Cookies("Read", "MAIL_Pswd");
         Pswd = Cookies("Read",  "OUT_Pswd") || MAIL_Pswd;

    if ( Pswd == "" || TMPswd[ AID + "OUT" ] ) {
      if ( TMPswd[ "My_submit" ] != "return" ) {
        TMPswd[ "My_submit" ] = "return";
        login( "OUT", function() {
          writeDocument( button, preview );
        });
        return false;
      }
      TMPswd[ "My_submit" ] = "";
    }
      var eMail, body;

          AID = localStorage.getItem( 'CurrentAccount' ) || "",
          BID = localStorage.getItem( 'CurrentMailBox' ) || "",
          MID = localStorage.getItem( 'CurrentMessage' ) || "",
       eMails = JSON.parse(localStorage.getItem('eMails')) || {};

    var eMail = ((eMails[ AID ].folders[ BID ] || {} ).data || {} )[ MID ] || {};

    body = $( '[name=edit_eMail_Message]');
    body.val( ssx( body.val() ) );
  }
  return true;
}
function EMAIL_My_onLoad() {
//         AID = "",
//         BID = "",
//         MID = "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  if ( AID == "")
    localStorage.removeItem( 'CurrentAccount');
  if ( BID == "")
    localStorage.removeItem( 'CurrentMailBox');
  if ( MID == "")
    localStorage.removeItem( 'CurrentMessage');

  Reset_eMails_Cookies();

  if ( refresh_AID ) {
    clearInterval( refresh_AID );
    refresh_AID = false;
    xSilent[ "LIST_MBOX" ] = undefined;
  }
  if ( JSON.stringify( eMails ).length < 3 ) {
    setTimeout(function() {
      Load_eMails_Edit_Account();
    }, 100);
  } else {
    List_Account();
  }
}
function EMAIL_Box_My_onLoad()  {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
//         BID = "",
//         MID = "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) );

//  localStorage.removeItem( 'CurrentMailBox');
//  localStorage.removeItem( 'CurrentMessage');

  Set_eMails_Cookies(eMail.account);

  if ( refresh_BID ) {
    clearInterval( refresh_BID );
    refresh_BID = false;
    xSilent[ "LIST_MAIL" ] = undefined;
  }
//  if ( ! AID)
//    return $("body").pagecontainer().pagecontainer("change", "#EMAIL", { transition: "flip" });

  if ( curr_AID != AID) {
    CurrentPage.find( "[data-role=header] h1" ).text(eMail.account.MAIL_Name);
    $( "#eMails_Box" + curr_AID ).hide();
    if ( $( "#eMails_Box" + AID).find("li").length ) {
      $( "#eMails_Box" + AID).show();
      curr_AID = AID;
    } else {
      List_Box("", false);
    };
  };
  if ( refresh_AID )
    clearInterval(refresh_AID);

  if ( eMail.folders.length )
    MAIL_CMD( "IN", "LIST_MBOX", "", Get_MailBox, true );

  z = ( 1 ) * 60 * 1000;
  if ( z  ) {
    refresh_AID = setInterval(function() {
      if ( eMail.folders.length )
        MAIL_CMD( "IN", "LIST_MBOX", "", Get_MailBox, true );
    }, z );
  } else {
    refresh_AID = false;
  }
}
function EMAIL_List_My_onLoad() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
//         MID = "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ), x, y, z;

//  localStorage.removeItem( 'CurrentMessage');

  if ( curr_BID != AID +"-"+ BID) {
    CurrentPage.find( "[data-role=header] h1" ).text(eMail.account.MAIL_Name);
    $( "#eMails_List" + AID +"-"+ BID ).hide();
    if ( $( "#eMails_List" + AID +"-"+ BID ).find("li").length ) {
      $( "#eMails_List" + AID +"-"+ BID ).show();
      curr_BID = AID +"-"+ BID;
    } else {
      List_eMails("",false);
    };
  };
  if ( refresh_BID )
    clearInterval(refresh_BID);

  if ( eMail.folders[ BID ].data.length )
    review_eMails( true );

  z = ( Cookies("Read", "MAIL_getMail_Time") || 0 ) * 60 * 1000;
  if ( z && Cookies("Read", "MAIL_getMail") ) {
    refresh_BID = setInterval(function() {
      if ( eMail.folders[ BID ].data.length )
        review_eMails( true );
    }, z );
  } else {
    refresh_BID = false;
  }
  List_eMails_icon();

  $( "#search_List" ).prop("placeholder","Busqueda en \"" + eMail.folders[ BID ].pathName +"\"" );
}
function EMAIL_View_My_onLoad() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
         MID = localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ), Command, Argv, Message;

  var _Mbox  = eMail.folders[ BID ]||{};
  var _Head  = _Mbox.data[ MID ]||{};
  var    UID = _Head.UID;

  if ( curr_MID == AID +"-"+ BID +"-"+ UID )
    return;

  if ( _Head.From.toUpperCase().indexOf( eMail.account.MAIL_User.toUpperCase() ) + 1 ) {
    z = _Head.From, _Head.From = _Head.To, _Head.To = z;
  }
  CurrentPage.find( "[data-role=header] h1" ).text( ( _Head.From||"" ).split(" <")[0] );

//  $( "#eMails_View" + curr_MID ).data( "YPOS", window.scrollY );
//  $( "#eMails_View" + curr_MID ).hide();

  if ( ! UID )
    return;

  if ( $( "#eMails_View" + AID +"-"+ BID +"-"+ UID ).length ) {
    $( "#eMails_View" + AID +"-"+ BID +"-"+ UID ).show();
    curr_MID = AID +"-"+ BID +"-"+ UID;
    $("#EMAIL_View").data("YPOS", $("#eMails_View"+ curr_MID).data("YPOS"));
    $.mobile.silentScroll( $( "#EMAIL_View" ).data( "YPOS" ) );

  } else {
    if ( eMail.account.IN_going == "IMAP" ) {
      Command = "FETCH ", Argv = "UID "+ UID +" RFC822\" Mail_BOX=\""+ _Mbox[ "pathName" ];

    } else {
      if ( eMail.account.MAIL_Keep ) {
        // TOP mantiene el eMail en el Servidor
        Command = "TOP" , Argv = _Head.Message+" 999999999";

      } else {
        // RETR elimina el eMail del Servidor
        Command = "RETR", Argv = _Head.Message;
      }
    }
    MAIL_CMD( "IN", Command, Argv, View_eMails, false );
  }
}
function EMAIL_Edit_Mail_My_onLoad() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
         MID = localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ), Command, Argv, Message;

  $.mobile.silentScroll( 0 );
  CurrentPage.find( "[data-role=header] h1" ).text(eMail.account.MAIL_Name);
}
function EMAIL_Edit_Account_My_onLoad() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
         MID = localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ),
     $eMails = $( "#EMAIL_Edit_Account [name=myForm]" ).find( "[name]" ).not(".NoUpDate"), x, y, z;

     Account = eMail.account;

  if ( ! AID)
    Account.MAIL_Keep = "ON";
  
  $eMails.each(function() {
    elm = this;

    switch ( elm.type ) {

      case "checkbox":
      case "radio":
        elm.defaultChecked = 
        elm.checked = ( ( Account[ elm.name ]+"\r\n" ).indexOf( elm.value+"\r\n" )+1 > 0 );
        try {$(elm).checkboxradio("refresh");} catch (err) {console.error(err)};
        break;

      case "select-one":
      case "select-multiple":
        $( elm ).find( "option" ).each(function() {
          this.defaultSelected =
          this.selected = ( ( Account[ elm.name ]+"\r\n" ).indexOf( this.value+"\r\n" ) + 1 > 0 );
          try {$(elm).selectmenu("refresh");} catch (err) {console.error(err)};
        });
        break;

      case "password":
        elm.defaultValue =
        elm.value        = ( Account[ elm.name ] ) ? ATH(atob(Account[ elm.name ])) : "";
        break;

      default:
        elm.defaultValue =
        elm.value        = ( Account[ elm.name ] ) ? Account[ elm.name ] : "";
        break;
    }
  });
  $( "[name=MAIL_Account]" ).val( AID);
  $( "[name=OUT_User]" ).prop("placeholder",$( "[name=MAIL_User]" ).val());
  $( "[name=IN_User]"  ).prop("placeholder",$( "[name=MAIL_User]" ).val());
  Show();
}
function Load_eMails_Account(e, evt) {
         AID = e || localStorage.getItem( 'CurrentAccount' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) );

  localStorage.setItem( 'CurrentAccount', AID);

  Set_eMails_Cookies(eMail.account);

  if ( eMail.account[ "IN_going" ] == "POP3" ) {
    $("body").pagecontainer().pagecontainer("change", "#EMAIL_List", { transition: "flip" });
  } else {
    if ( curr_AID != AID ) {
      $( "#eMails_Box" + curr_AID ).hide();
      $( "#eMails_Box" + AID ).show();
//      $("#EMAIL_Box").find( "[data-role=header] h1" ).text( (eMail.account.MAIL_Name||"") );
    }
    $("body").pagecontainer().pagecontainer("change", "#EMAIL_Box", { transition: "flip" });
  }
}
function Load_eMails_Box(e, evt) {
      BID = e || localStorage.getItem( 'CurrentMailBox' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) );

  localStorage.setItem( 'CurrentMailBox', BID );

  if ( curr_BID != AID +"-"+ BID ) {
    $( "#eMails_List" + curr_BID ).hide();
    $( "#eMails_List" + AID +"-"+ BID ).show();
//    $( "#EMAIL_List" ).find( "[data-role=header] h1" ).text( (eMail.account.MAIL_Name||"") );
    $( "#search_List" ).prop("placeholder","Busqueda en \"" + eMail.folders[ BID ].pathName +"\"" );
  }
  $("body").pagecontainer().pagecontainer("change", "#EMAIL_List", { transition: "flip" });
}
function Load_eMails_View(e, evt) {
         MID = e || localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) );

  localStorage.setItem( 'CurrentMessage', MID );

  var    UID = eMail.folders[ BID ].data[ MID ].UID;

  if ( curr_MID != AID +"-"+ BID +"-"+ UID ) {
    $( "#eMails_View" + curr_MID ).data( "YPOS", $( "#EMAIL_View" ).data( "YPOS" ) );
    $( "#eMails_View" + curr_MID ).hide();
    $( "#eMails_View" + AID +"-"+ BID +"-"+ UID ).show();
    $( "#EMAIL_View" ).data( $( "#eMails_View" + AID +"-"+ BID +"-"+ UID ).data( "YPOS" ) );
//    $("#EMAIL_View").find( "[data-role=header] h1" ).text( (eMail.folders[ BID ].data[ MID ].From||"").split(" <")[0] );
  }
  $("body").pagecontainer().pagecontainer("change", "#EMAIL_View", { transition: "flip" });
}
function Load_eMails_Edit_Mail(e, evt) {
  evt = evt || event;

  var elm = $( "#eMails_List" + AID +"-"+ BID ), subject, message, file, x, y, z,
    eMail = ((eMails[ AID ].folders[ BID ] || {} ).data || {} )[ MID ] || {},
      UID = eMail.UID,
     body = $( "#eMails_View" +  AID +"-"+ BID +"-"+ UID ).find( "[name=eMails_View_body]:first" ),
   attach = $( "#eMails_View" +  AID +"-"+ BID +"-"+ UID ).find( "[name=eMails_View_attach]:first" );

  cancel_eMails( MID );
  if( MID ) {
    x = ( e == "Re:"  ) ? "RE: RI: AN: " : "FWD: RV: WEI: ";
    subject = eMail[ "Subject" ], y = subject.indexOf( ":" ) + 1;
    if ( ! y || x.indexOf(subject.toUpperCase().substr(0,y)) )
      subject = e + " "+ subject

    if ( e == "Re:" ) { // Reply
      message = '<div dir="ltr"><br></div><br><div><div dir="ltr">El '+
      DateToString_ES( eMail[ "Date" ], "Short_Date" ) +', '+ 
      eMail[ "From" ].split("<").join("&lt;") +' escribió:</div><blockquote class="gmail_quote" style="margin: 0px 0px 0px 0.8ex; border-left: 1px solid rgb(204, 204, 204); padding-left: 1ex;"><div dir="auto">'+ 
      body.html() +'<div dir="auto">&nbsp;</div></div></blockquote></div>';
      z = $( "[name=edit_eMail_To]" ), z.val( eMail[ "From" ] ), z.prop("defaultValue", eMail[ "From" ] ), z.prop("readonly",true);

    } else {  // Forward
      message = '<br><br>&nbsp;<div>---------- Mensage reenviado ---------<div dir="ltr">De: <strong dir="auto">'+
      eMail[ "From" ].split("<")[0] +'</strong> <span dir="auto">&lt;'+
      eMail[ "From" ].split("<")[1] +'</span><br>Enviado: '+
      DateToString_ES( eMail[ "Date" ], "Short_Date" ) +'<br>Para: &lt;'+
      eMail[ "To" ].split("<")[0] +'<br>Asunto: '+ 
      eMail[ "Subject" ] +'<br>&nbsp;</div><br><br>&nbsp;<div dir="auto">\n\n'+
      body.html() +'<div dir="auto">&nbsp;</div></div></div>'
      setTimeout(function(){
        z = $( "[name=edit_eMail_To]" ), z.focus();
      },500);
      var files = [], inputFile = Get_Attachment(0);
      attach.find( ".miniPreview" ).each(function(e) {
        z = this.dataset.datauri.split(":")[1]||"";
        string   = atob( z.split("base64,")[1]||"" );
        fileType = z.split(";")[0];
        fileName = this.dataset.filename;
        for ( var buffer = [], i = 0; i < string.length; i++ ) {
          buffer.push(string.charCodeAt(i));
        }
        buffer = new Uint8Array(buffer).buffer;
        files.push( new File( [ buffer ], fileName, { "type":fileType } ) );
      });
      inputFile.files = new FileListItem(files);
      Set_Attachment(inputFile);
    }
//    CurrentPage.find( "[data-role=header] h1" ).text( eMail[ "To" ].split(" <")[0] );
    z = $( "[name=edit_eMail_Subject]" );
    z.val( subject ).prop("defaultValue", subject );

    z = $( "[name=edit_eMail_Message]" );
    z.val( message ).prop("defaultValue", message );

  } else {
    z = $( "[name=edit_eMail_To]" ).prop("readonly",false);
    z = $( "[name=edit_eMail_Subject]" ).prop("readonly",false);
  }
  x = eMails[ AID ].account.MAIL_User;
  z = $( "#edit_eMail_From" );
  z.val( x ).prop("defaultValue", x );

//  body.hide();
//  $("#EMAIL_Edit_Mail").find( "[data-role=header] h1" ).text( eMails[ AID ].account[ "MAIL_Name" ] );
  $("body").pagecontainer().pagecontainer("change", "#EMAIL_Edit_Mail", { transition: "flip" });
  textEditor("edit");
}
function Load_eMails_Edit_Account(e, evt) {
  evt = evt || event || new Event("MouseEvent");
  evt.preventDefault();
  evt.stopPropagation();

  AID = e || "";//localStorage.getItem( 'CurrentAccount' ) || "";

  localStorage.setItem( 'CurrentAccount' , AID);

  $("body").pagecontainer().pagecontainer("change", "#EMAIL_Edit_Account", { transition: "flip" });
}
function List_Account(e, Silient, evt) {
   eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var $ul = $( "#eMails_account" ), html = "";

  $ul.html("");

  for (var index in eMails) {
    eMail = eMails[ index ];
    date  = DateToString_ES( eMail.last_upDate, "Month_Long Day_Long" );

    if ( date == "Invalid Date" ) {
      date  = "No Actualizado";
      time  = "";
    } else {
      date  = date.split(" ");
      time  = date[4].split(":");
      date  = date[0]+", "+date[1]+" "+date[2]+" "+date[3];
      time  = time[0]+":"+time[1];
    }
    html += '<li data-role="list-divider" title="Fecha de la Ultima Actualizacion">'+ date + ((time)?", ":" ") + time;
    if ( eMail.messages ) {
      if ( eMail.size ) {
        size = eMail.size / 1000, z = " KB";
        if ( size > 1000 )  size = size / 1000, z = " MB";
        size = "("+ MASK( "", size, "###,###,##0", 0 ).trim() + z +")";
        title_size = "(y Espacio que Ocupan) ";
      } else {
        size = "";
        title_size = "";
      }
      html += '<span class="ui-li-count" title="Total Mensajes Almacenados '+ title_size +'en el Servidor">'+ MASK("", eMail.messages, "###,###,##0", 1) +'&nbsp;&nbsp; '+ size +'</span>';
    }
    html += '</li>';
    html += '<li';
    html += ' ><a onclick="Load_eMails_Account(\''+ index +'\')">';
      if ( eMail.unseen || eMail.recent ) {
        
        html += '  <p class="ui-li-aside">';
        html += '   <strong title="Mensajes sin leer">'+ MASK("", NUM(eMail.unseen), "###,###,##0", 1)+"</strong>";
/*        html += '  Mensajes ';
        if ( eMail.unseen )
          html += ' Sin Leer <strong>'+ MASK("", eMail.unseen, "###,###,##0", 1)+"</strong><br>";
        if ( eMail.recent )
          html += ' Recientes <strong>'+ MASK("", eMail.recent, "###,###,##0", 1)+"</strong><br>";*/
        html += ' </p>';
      };
    html += '  <h2>'+ eMail.account[ "MAIL_Name" ] +'</h2>';
    html += '  <p><strong>'+ eMail.account[ "MAIL_User" ] +'</strong></p>';
    html += ' </a>';
    html += ' <a onclick="Load_eMails_Edit_Account(\''+ index +'\')">Editar Cuenta</a>';
    html += '</li>';
  }
  $ul.append( html );
  $ul.listview( "refresh" );
  $ul.trigger( "updatelayout");

  $ul = $( "#eMails_account" );
  $ul.find("li").not(".ui-li-divider").each(function(){$(this).attr("data-icon","false")})
  $ul.listview( "refresh" );
  $ul.trigger( "updatelayout");
}
function List_Box(e, Silent, evt) {
  var eMail, elm, $ul, html, x, y, z;
//    eMail, elm, $ul, html, x, y, z;

      AID = localStorage.getItem( 'CurrentAccount' ) || "";
   eMails = JSON.parse(localStorage.getItem('eMails')) || {};
    eMail = eMails[ AID ];
      elm = eMail.folders;

  if ( ! elm.length && e != "end_of_loading")
    return MAIL_CMD( "IN", "LIST_MBOX", "", Get_MailBox, Silent );

      $ul = $( "#eMails_Box"+ AID);

  if ( ! $ul.length ) {
    $( "#EMAIL_Box_content" ).append(
      '<ul id="eMails_Box'+ AID +'" data-role="listview" data-inset="true" data-theme="a" data-mini="true" data-filter="true" data-split-icon="gear" data-input="#search_Box"></ul>'
    ).trigger("create");
    $ul = $( "#eMails_Box"+ AID);
  }
  html = "";
  elm.forEach(function(json, index) {
    var 
    _PathName    = json[ "pathName"    ],
    _Flags       = json[ "flags"       ],
    _Messages    = json[ "messages"    ],
    _Unseen      = json[ "unseen"      ],
    _Recent      = json[ "recent"      ],
    _Delimiter   = json[ "delimiter"   ],
    _Uidnext     = json[ "uidnext"     ],
    _Uidvalidity = json[ "uidvalidity" ],
    _Data        = json[ "data"        ],
    _Size        = json[ "size"        ],
    _Last_upDate = json[ "last_upDate" ],
    _SortBy      = json[ "sortBy"      ],
    _Reverse     = json[ "reverse"     ];

    if ( _Flags.indexOf( "Noselect" ) > -1 ) {
      html += '<li data-role="list-divider">'+ _PathName +'</li>';

    } else {
      html += '<li>'
      html += ' <a onclick="Load_eMails_Box(\''+ index +'\')">';
      if ( _Messages || _Unseen || _Recent ) {
        html += '  <p class="ui-li-aside">Mensajes ';
//      if ( _Unseen )
          html += ' Sin Leer <strong>'+ MASK("", _Unseen, "###,###,##0", 1)+"</strong><br>";
//      if ( _Recent )
          html += ' Recientes <strong>'+ MASK("", _Recent, "###,###,##0", 1)+"</strong><br>";
        html += ' Total <strong>'+ MASK("", _Messages, "###,###,##0", 1) +'</strong></p>';
      };
      z = _PathName.split("/");
      html += '  <h2>'+ z[z.length-1] +'</h2>';
      html += ' </a>';
      html += ' <a class="folderSelect" onclick="check_Boxs(\''+ AID +'\')">Seleccionar Carpeta</a>';
      html += '</li>';
    };
  })
  $ul.html( html )
  $ul.listview( "refresh" );
  $ul.trigger( "updatelayout");
  curr_AID = AID;
}
function List_eMails(e, Silent, evt) {
  var eMail, elm, mBox, $ul, html, _Message, _From, _Subject, _Content, _Date, _Time, order, current_order, x, y, z;

     AID = localStorage.getItem( 'CurrentAccount' ) || "";
     BID = localStorage.getItem( 'CurrentMailBox' ) || "";
  eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  eMail  = eMails[ AID ],
  mBox   = eMail.folders[ BID ],
     elm = mBox.data,
     $ul = $( "#eMails_List" + AID +"-"+ BID ),
    html = "";

  if ( ! elm.length && e != "end_of_loading") {
    _Message = mBox.messages;// - eMail.data.length;
    mBox.last_Message = _Message;
    eMail.folders[ BID ] = mBox;
    eMails[ AID ] = eMail;
    localStorage.setItem( 'eMails', JSON.stringify( eMails ) );

    return MAIL_CMD( "IN", "LIST_MAIL", "0 "+ ( 10 + _Message ) +"\" Mail_BOX=\""+ mBox[ "pathName" ], Get_MailLst, Silent );
  }
  if ( ! $ul.length ) {
    $( "#EMAIL_List_content" ).append(
      '<ul id="eMails_List'+ AID +"-"+ BID +'" data-role="listview" data-inset="true" data-theme="a" data-mini="true" data-filter="true" data-split-icon="mail" data-input="#search_List"></ul>'
    ).trigger("create");
    $ul = $( "#eMails_List" + AID +"-"+ BID );
  }
  $ul.html("")
  elm.forEach(function(json, index) {
    _Message   = json[ "Message"    ];
    _MessageID = json[ "Message-ID" ];
    _From      = json[ "From"       ];
    _To        = json[ "To"         ];
    _Date      = json[ "Date"       ];
    _Subject   = json[ "Subject"    ];
    _Content   =(json[ "Content"    ] || "").split(/\r|\n|\t|\x08|\x09|\x0A|\x0B|\x0C|\x0D/).join(" ").trim();
    _Flag      = json[ "Flag"       ];

    if ( _From.toUpperCase().indexOf( eMail.account.MAIL_User.toUpperCase() ) + 1 ) {
      z = _From, _From = _To, _To = z;
    }
/**    if ( ! _Content ) {
      _Content = _Subject.substr( _Subject.length / 2 );
      _Content = _Content.substr( _Content.indexOf(" ") + 1 );
      _Subject = _Subject.substr( 0, _Subject.length - _Content.length );
    }**/
    z    = DateToString_ES( _Date, "Month_Long Day_Long" );
    if ( z == "Invalid Date" )
      z  = DateToString_ES( "", "Month_Long Day_Long" );

    z        = z.split(" ");
    _Date    = (z[0]+", "+z[1]+" "+z[2]+" "+z[3]+" "+z[4]+" "+z[5]).trim();

    z        = z[6].split(":");
    _Time    = z[0]+":"+z[1];

    switch ( eMail.sortBy ) {

      case "From":
        order = "From: " + _From.split( " <" )[0],
        _Time = _Date+", "+_Time;
        break;

      case "To":
        order = "To: " + _To.split( " <" )[0],
        _Time = _Date+", " + _Time;
        break;

      case "Subject":
        order = _Subject.substr( 0, 5 + _Subject.substr(5).indexOf(" ") ),
        _Time = _Date+", " + _Time;
        break;

      case "Content":
        order = _Content.substr( 0, 5 + _Content.substr(5).indexOf(" ") ),
        _Time = _Date+", " + _Time;
        break;

      default:
        order = _Date;
        break
    };
    if ( order != current_order ) {
      html += '<li data-role="list-divider">'+ order;
      html += '<span id="date_'+ escape(order) +'" class="ui-li-count">1</span></li>';
      current_order = order;
    } else {
      x = '<span id="date_'+ escape(order) +'" class="ui-li-count">';
      y = html.split( x );
      z = y[1].indexOf("<");
      y[1] = (NUM(y[1].substr(0,z)) + 1) + y[1].substr(z)
      html = y.join( x );
    };
    if ( _Flag.indexOf(" SEEN ") + 1 ) {
      var see = ["<p><strong>","</strong></p>","<p>","</p>","mail-open"];
    } else {
      var see = ["","","<p><strong>","</strong></p>","mail"];
    }
    html += '<li>'
    html += ' <a onclick="Load_eMails_View(\''+ index +'\')">';
    html += '  <p class="ui-li-aside"><strong>'+ _Time +'</strong></p>';
    html += '  '+see[0]+ _From.split( " <" )[0] +see[1];
    html += '  '+see[2]+ _Subject.substr(0,80).split("<").join("&lt;") +see[3]+'</p>';
//    html += '          <p>'+ _Content.substr(0,80).split("<").join("&lt;") +'</p>';
    html += ' </a>';
    html += ' <a class="mesgSelect" onclick="check_eMails(\''+ AID +'\')" data-icon="'+see[4]+'">Seleccionar Mensaje</a>';
    html += '</li>';
  })
  $ul.append( html );
  $ul.listview( "refresh" );
  $ul.trigger( "updatelayout");
  curr_BID = AID +"-"+ BID;

//  eMails[ AID ] = eMail;
//  localStorage.setItem( 'eMails', JSON.stringify( eMails ) );
}
function List_eMails_icon() {
  var elm, Order, toggle, x, y, z;

  if ( ! BID )
    return ;

  elm = $("#EMAIL_List li a[name^=Panel_List_By]");
  if ( elm.length ) {
    elm.each(function() {
      z = $(this);
      z.removeClass("ui-icon-mail");
      z.removeClass("ui-icon-mail-open");
      Order = this.name.split("By")[1];
      if ( eMails[ AID ].folders[ BID ].sortBy == Order ) {
        z.removeClass("ui-icon-delete-red");
        z.addClass("ui-icon-check-green");
      } else {
        z.removeClass("ui-icon-check-green");
        z.addClass("ui-icon-delete-red");
      }
    });
  }
  elm = $("#EMAIL_List li a[name=Panel_List_reverse]");
  if ( elm.length ) {
    elm.removeClass("ui-icon-carat-r");
    if ( eMails[ AID ].folders[ BID ].reverse ) {
      elm.removeClass("ui-icon-arrow-d");
      elm.addClass("ui-icon-arrow-u");
    } else {
      elm.removeClass("ui-icon-arrow-u");
      elm.addClass("ui-icon-arrow-d");
    }
  }
  toggle = parseInt( eMails[ AID ].folders[ BID ].reverse );
  $("#EMAIL_List [name=Panel_List_reverse]").html( toggle ? "Orden Ascendente" : "Orden Descendente" );
  toggle = parseInt( localStorage.getItem( 'lit@Mail_edit') );
  $("#EMAIL_View [name=Panel_View_Editor]").html( toggle ? "Editor Avanzado" : "Editor Simple" );
  textEditor("cancel");
  textEditor("edit");
}
function View_eMails(e, evt) {
  var
   eMail, data, view, eMailParser, body, attach, x, y, z;

      AID = localStorage.getItem( 'CurrentAccount' ) || "";
      BID = localStorage.getItem( 'CurrentMailBox' ) || "";
      MID = localStorage.getItem( 'CurrentMessage' ) || "";
   eMails = JSON.parse(localStorage.getItem('eMails')) || {};
    eMail = eMails[ AID ];
      UID = eMail.folders[ BID ].data[ MID ].UID;

  data = e.data;
  if ( data.indexOf( "-ERR" ) + 1 )
    return jQuery_confirm("Error!","Se recomienda Recargar los Mensajes", "", "", "", "", "");

  view = $( '#eMails_View'+ AID +"-"+ BID +"-"+ UID );
  if ( ! view.length ) {
    $( "#EMAIL_View_content" ).append(
      '<div id="eMails_View'+ AID +"-"+ BID +"-"+ UID +'"><div name="eMails_View_body"></div><div name="eMails_View_attach"></div></div>'
    );
    view = $( '#eMails_View'+ AID +"-"+ BID +"-"+ UID );
  }
  data = data_decode(data);

  z    = data.split("\n");
  if ( eMail.account[ "IN_going" ] == "POP3" ) {
    z.shift();
    if ( z[ z.length-1 ] != "." ) { z.pop(); }
    z.pop();
  } else {
    x=z.length;
    while ( x-->z.length-10 && ( z[ x ].substr(0,5) == "QUERY" || z[ x ].substr(-1) != ")" ) ) {};
    if ( z[ x ].substr(-1) == ")" ) { 
      z[ x ] = z[ x ].substr(0, z[ x ].length - 1);
      z.splice( x + 1, z.length - x );
      
    };
  }
  data = z.join("\n")+"\n";

  eMailParser = new get_eMailParser( data );
  data = eMailParser.message;
  if ( data.contentType_HTML ) {
    z = data.content_HTML;
  } else {
    z = (data.content_TEXT||"").replace(/\n/g, "<br>\n");
  }
  body = view.find("[name=eMails_View_body]:first");
  body.html( xss( z ) );
  body.find("a").prop("target","_blank");

  curr_MID = AID +"-"+ BID +"-"+ UID;

  if ( data.mimeFragments.length ) {
    var attach = view.find("[name=eMails_View_attach]:first");
    attach.data( "count", "0" );
    searchAttachment( data.mimeFragments, attach, body );
    z = attach.data( "count" );
    if ( parseInt( z ) ) {
      x = ( z > "1" ) ? "s" : "";
      attach.prepend( "<hr><h4>"+ z +" archivo"+x+" adjunto"+x+"</h4>" );
    }
  }
  if ( eMail.folders[ BID ].data[ MID ].Flag.indexOf(" SEEN ") == -1 ) {
    eMail.folders[ BID ].data[ MID ].Flag += " SEEN ";
    eMails[ AID ] = eMail;
    localStorage.setItem( 'eMails', JSON.stringify( eMails ) );
    x = $( "#eMails_List" + AID +"-"+ BID );
    x = x.find( "a[onclick=Load_eMails_View\\(\\'"+ MID +"\\'\\)]" ).closest( "li" );
    z = x.html();
    z = z.split("ui-icon-mail").join("ui-icon-mail-open");
    z = z.split('data-icon="mail"').join('data-icon="mail-open"');
    z = z.split("<p>");
    z[1] = z[1].split("<strong>").join("").split("</strong>").join("");
    y = z[0].split("</p>");
    y[ y.length - 1 ] = "<p><strong>"+ y[ y.length - 1 ] +"</strong></p>";
    z[0] = y.join("</p>");
    x.html(z.join("<p>"));
  }
}
function searchAttachment(data,attach,body) {
  console.log(data);
  var e, x, y, z;
  data.forEach(function(elm) {
    e = elm.eMailParser.message;
    if ( e.mimeFragments.length ) {
      searchAttachment( e.mimeFragments, attach, body )
    } else {

      x = ( e.headers[ "content-type" ] || "");
      var contentType = x.split(";")[0].toLowerCase();

      z = x.toLowerCase().indexOf( 'charset=' )
      y = x.split( x.substr(z,8) );
      var charset = (y[1]||"").replace(/"/g,"").split(";")[0].toLowerCase();

      z = x.toLowerCase().indexOf( 'name=' )
      y = x.split( x.substr(z,5) );
      var name = (y[1]||"").replace(/"/g,"").split(";")[0];

      x = ( e.headers[ "content-transfer-encoding" ] || "");
      var encoding = x.split(";")[0].toLowerCase();

      x = ( e.headers[ "content-id" ] || "");
      var contentId = x.split(";")[0];

      x = ( e.headers[ "content-disposition" ] || "" );
      var contentDisp = x.split(";")[0].toLowerCase();

      z = x.toLowerCase().indexOf( 'filename=' )
      y = x.split( x.substr(z,9) );
      var fileName = (y[1]||"").replace(/"/g,"").split(";")[0];

      z = e.raw.search(utility.regexes.doubleNewLine);
      var fileRaw = e.raw.substring(z);

      if ( encoding == "base64" ) {
        var fileBase64 = fileRaw.replace(/\n/g,""),
        fileRaw    = atob( fileBase64 );//decodeBASE64( fileBase64 );
      } else if (encoding == "quoted-printable" ) {
        fileRaw    = utility.decodeQuotedPrintable( fileRaw );
        var fileBase64 = btoa( fileRaw );//decodeBASE64( fileRaw );
      } else {
        var fileBase64 = btoa( fileRaw );//decodeBASE64( fileRaw );
      }
      var fileSize = fileRaw.length;

      var ext = fileName.split("."),
          ext = ext[ext.length-1];

      var fileType = contentType;

      switch ( ext ) {

        case "pdf":
        case "zip":
          fileType = "application/"+ ext;
          break;

        case "xls":
        case "xlsx":
          fileType = "application/vnd.ms-excel";
          break;

        case "doc":
        case "docx":
          fileType = "application/msword";
          break;

        case "csv":
          fileType = "text/csv";
          break;

        case "txt":
          fileType = "text/plain";
          break;

        case "htm":
        case "html":
          fileType = "text/html";
          break;

        case "mp3":
        case "mp4":
        case "wav":
          fileType = "audio/mp3";
          break;

        case "jpeg":
        case "jpg":
        case "gif":
        case "png":
        case "svg":
          fileType = "image/"+ ext;
          if ( ext == "svg" )
            fileType += "+xml";

          break;
            
        default:
          fileType = contentType;
      }
      if ( contentId ) {
        dataURI = "data:"+fileType +";base64,"+ fileBase64 ;//encodeURI( fileBase64 );
        x = ( contentId.split( "<" )[1]||"" ).split( ">" )[0];
        y = body.html().split( "cid:"+ x );
        if ( y.length > 1 ) {
          body.html( y.join( dataURI ) );
          contentDisp = contentDisp.toUpperCase();
        }
      }
      if ( contentDisp.indexOf( "attachment" ) + 1 && fileName ) {
        dataURI = "data:"+fileType +";base64,"+ fileBase64 ;//encodeURI( fileBase64 );
        var img = document.createElement("img");
        img.id  = "image_"+ HTA(fileName);
        img.src = dataURI;
        img.classList.add("miniPreviewImg");

        var anchor = $( '<div class="miniPreview" onclick="view_DataURI(this.dataset.datauri, this.dataset.filename)" data-dataURI="'+ dataURI +'", data-fileName="'+ fileName +'", title="'+ fileName +'"></div>');
        anchor.append( img );
        attach.append( anchor );
        attach.data( "count", 1 + parseInt( attach.data( "count" ) ) );

        if ( ! ( fileType.indexOf( "image" ) + 1 ) ) {
          img = attach.find( "#image_"+ HTA(fileName) )[0];

          var files = [ new File( [ fileRaw ], fileName, { "type":fileType } ) ];
          var inputFile = document.createElement("input");
          inputFile.id = "file_"+ HTA(fileName);
          inputFile.type  = "file";
          inputFile.filename = dataURI;
          inputFile.files = new FileListItem(files);
          photoChange( img, {"target":inputFile} );
        }
      }
    }
  });
}
function utf8_to_b64( code ) {
  try { return window.btoa(unescape(encodeURIComponent( code ))); }
  catch (err) {
    var z = code.length;
    if (z > 1) {
      z = parseInt( z / 2 );
      return utf8_to_b64( code.substr(0,z) ) + utf8_to_b64( code.substr(z) );
    } else {
      return code;
    }
  }
}
function b64_to_utf8( code ) {
  try { return decodeURIComponent(escape(window.atob( code ))); }
  catch (err) {
    var z = code.length;
    if (z > 1) {
      z = parseInt( z / 2 );
      return b64_to_utf8( code.substr(0,z) ) + b64_to_utf8( code.substr(z) );
    } else {
      return code;
    }
  }
}
function view_DataURI(data, fileName, e) {
//  var type = ["application/pdf", "audio/mp3", "audio/mp4", "audio/wav", "image/jpeg", "image/jpg", "image/gif", "image/png", "image/svg+xml", "text/plain", "text/csv"," text/html" ], x, y, z;
  var type = [ "/images/file-xls.png", "/images/file-doc.png", "/images/file-zip.png", "/images/file-unknown.png" ], x, y, z;
  e = e || event;
  var $elm = $(e.target);
  var file = ( $elm.prop("src") || "" ).split(location.host)[1] || "";
  if ( ( type.indexOf( file ) + 1 ) ) {
    var link = document.createElement('a');
    link.download = fileName;
    link.href = data;
    link.click();
  } else {
    var iframe = "<iframe width='100%' height='100%' src='" + data + "'></iframe>";
    x = window.open();
    x.document.write(iframe);
    y = x.document.getElementsByTagName("iframe")[0];
    z = y.closest("body");
    z.style.margin = "0px";
    z.style.overflow="hidden";
    setTimeout(function() {
      y.focus();
      z.focus();
    }, 1000);
  }
}
function FileListItem(a) {
  a = [].slice.call(Array.isArray(a) ? a : arguments)
  for (var c, b = c = a.length, d = !0; b-- && d;) d = a[b] instanceof File
  if (!d) throw new TypeError("expected argument to FileList is File or array of File objects")
  for (b = (new ClipboardEvent("")).clipboardData || new DataTransfer; c--;) b.items.add(a[c])
  return b.files
}
function Edit_eMails_update() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "";
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = JSON.parse( JSON.stringify( accountTemplate ) ),
      action = $(myForm).find( "[name=button]" ).val(), z, elm, $eMails;
  
  if ( action == "Acepta" ) {

     $eMails = $( "#EMAIL_Edit_Account [name=myForm]" ).find( "[name]" ).not( ".NoUpDate" );

    $eMails.each(function( index ) {
      elm = this;

      switch ( elm.type ) {

        case "checkbox":
        case "radio":
          z = ( elm.checked ) ? elm.value : "";
          if ( ! eMail.account[ elm.name ] ) {
            eMail.account[ elm.name ] = "";
          } else if ( eMail.account[ elm.name ] != "" && z != "") {
            eMail.account[ elm.name ] += "\r\n";
          }
          eMail.account[ elm.name ] += z;
          break;

        case "select-one":
        case "select-multiple":
          z = ( elm[elm.selectedIndex].selected) ? elm[elm.selectedIndex].value : "";
          if ( ! eMail.account[ elm.name ] ) {
            eMail.account[ elm.name ] = "";
          } else if ( eMail.account[ elm.name ] != "" && z != "") {
            eMail.account[ elm.name ] += "\r\n";
          }
          eMail.account[ elm.name ] += z;
          break;
          
        case "password":
          eMail.account[ elm.name ] = ( $( "#MAIL_Remind" ).is( ":checked" ) ) ? btoa(HTA(elm.value)) : "";

          break;

        default:
          eMail.account[ elm.name ] = elm.value;
          break;
       }
    });
    AID = AID || "id_" + new Date().getTime();

    eMails[ AID ] = eMail;
    TMPswd[ AID ] = "";

  } else if ( AID && action == "Elimina" ) {
    delete eMails[ AID ];
  }
  localStorage.setItem( 'eMails', JSON.stringify( eMails ) );

  STDIO_ready('goBack(-1)');
}
function check_eMails(e,evt) {
  evt = evt || event;
  var elm = $( "#eMails_List" + AID +"-"+ BID ), x, y, z;

  if ( evt == "all") {
    elm.find("a.mesgSelect");

    elm.find("[data-icon=mail]")
      .removeClass("ui-icon-mail")
      .addClass("ui-icon-check-green ui-nodisc-icon");

    elm.find("[data-icon=mail-open]")
      .removeClass("ui-icon-mail-open")
      .addClass("ui-icon-check-green ui-nodisc-icon");

  } else if ( evt == "toggle") {
    elm.find("a.mesgSelect").not("a.mesgSelect.ui-icon-delete-red");

    elm.find("[data-icon=mail]")
      .toggleClass("ui-icon-mail")
      .toggleClass("ui-icon-check-green ui-nodisc-icon");

    elm.find("[data-icon=mail-open]")
      .toggleClass("ui-icon-mail-open")
      .toggleClass("ui-icon-check-green ui-nodisc-icon");

  } else {
    z = $( evt.target )
    if ( z.hasClass("ui-icon-delete-red" ) ) {
      jQuery_confirm("Info",
                     "El mensaje fue eliminado y no puede ser recuperado");
    } else {
      z.toggleClass("ui-icon-"+z.data("icon"))
       .toggleClass("ui-icon-check-green ui-nodisc-icon");
    }
  }
  if ( elm.find("a.mesgSelect.ui-icon-check-green").length ) {
    $(".Footer_List_newMail").hide();
    $(".Footer_List_checked").show();
  } else {
    $(".Footer_List_newMail").show();
    $(".Footer_List_checked").hide();
  }
}
function cancel_eMails(evt) {
  evt = evt || event;

  var elm = $( "#eMails_List" + AID +"-"+ BID ), subject, message, x, y, z,
    eMail = ((eMails[ AID ].folders[ BID ] || {}).data || {})[ MID ] || {};

  textEditor("cancel");

  z = $("[name=edit_eMail_From]"   ), z.val(""), z.prop("defaultValue", "");

  z = $("[name=edit_eMail_To]"     ), z.val(""), z.prop("defaultValue", "");
  z.prop("readonly",false);

  z = $("[name=edit_eMail_Cc]"     ), z.val(""), z.prop("defaultValue", "");
  z = $("[name=edit_eMail_Bcc]"    ), z.val(""), z.prop("defaultValue", "");

  z = $("[name=edit_eMail_Subject]"), z.val(""), z.prop("defaultValue", "");
  z.prop("readonly",true);

  z = $("[name=edit_eMail_Message]"), z.val(""), z.prop("defaultValue", "");

  $( '.edit_eMail_Cc'  ).css( 'display','none' );
  $( '.edit_eMail_Bcc' ).css( 'display','none' );
  $( '#Attachments'    ).css( 'display','none' )
  .find("a").each(function() {
    Set_Attachment( this, "delete" );
  });
//  if ( evt === true ) {
//    STDIO_ready('goBack(-1)');
//    KEYS_27();
//    ESCAPE2=0;
//    KEYS_27();
//  }
}
function delete_eMails(evt) {
  evt = evt || event;

  var elm = $( "#eMails_List" + AID +"-"+ BID ), x, y, z,
    eMail = eMails[ AID ] || JSON.parse(JSON.stringify( accountTemplate )),
     mBox = eMail.folders[ BID ],
 messages = "";

  if ( typeof evt == "object" ) {
    elm = elm.find("li").not(".ui-screen-hidden, .ui-li-divider");
    elm.each(function() {
      x = $(this);
      y = x.find( "a.mesgSelect.ui-icon-check-green" );
      if ( y.length ) {
        z = x.find( "a:first" ).attr( "onclick" ).split( "'" )[1];
        messages += "," + mBox.data[ z ].UID;
      };
    });
  } else { 
    elm = elm.find( "a[onclick=Load_eMails_View\\(\\'"+ evt +"\\'\\)]" ).closest( "li" );
    if ( elm.length )
      messages += "," + mBox.data[ evt ].UID;
  }
  if ( ! messages )
    return

  messages = messages.substr(1);
  var z = messages.split(",").length,
      s = ( z == 1 ) ? ""  :"s",
      n = ( z == 1 ) ? "el": z;

  jQuery_confirm("Alerta!", "Se dispone a eliminar "+ n +" Mensaje"+s+", una vez eliminado"+s+" no podra recuperarlo"+s, [
  {
    text: "Acepta", click: function() {
      KEYS_27(1);
//      MAIL_CMD( "IN", "DELE", messages +"\" Mail_BOX=\""+ mBox[ "pathName" ], function() {
      MAIL_CMD( "IN", "STORE", "UID "+messages+" %2BFLAGS.SILENT ("+"\\\Deleted)\" Mail_BOX=\""+ mBox[ "pathName" ], function() {
        elm.each(function() {
          z = $(this).find("a.mesgSelect.ui-icon-check-green");
          if ( z.length == 0 && elm.length == 1 ) {
            z = $(this).find("a.mesgSelect");
            z.removeClass("ui-icon-mail ui-icon-mail-open");
            z.addClass("ui-icon-check-green ui-nodisc-icon");
          };
          if ( z.length ) {
            z.removeClass("ui-icon-check-green");
            z.addClass("ui-icon-delete-red");
          };
        });
        if ( $("a.mesgSelect.ui-icon-check-green").length ) {
          $("input.mesgSelect").button('enable');
        } else {
          $("input.mesgSelect").button('disable');
        }
        jQuery_confirm("info", "Mensaje"+s+" Eliminado"+s+" exitosamente!");
      }, false);
    }
  },
  { 
    text: "Cancela", click: function() {
      history.back();
    }
  }]);
}
function print_eMails(e) {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
         MID = localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ),
         UID = eMail.folders[ BID ].data[ MID ].UID, My_Window, message;

  Set_eMails_Cookies(eMail.account);

  if ( e == "text/html" ) {
    message = $( '#eMails_View'+ AID +"-"+ BID +"-"+ UID ).html() || "";
    z="close();"
  } else {
    if ( e == "text/plain" ) {
      message = $( '#eMails_View'+ AID +"-"+ BID +"-"+ UID );
      message.find("script").each(function() {
        message.html(message.html().split(this.outerHTML).join())
      })
      message.find("style").each(function() {
        message.html(message.html().split(this.outerHTML).join())
      })
      message = (message.text() || "").replace(/(\s\s\s*)/g, ' \n');
    } else {
      message = (eMail.folders[ BID ].data[ MID ] || {}).Content||"";
    }
    message = '<font face="Courier New" size="4"><br><br>' + message.split("\n").join("<br>\n") + '</font>';
    z=""
  }
  My_Window = window.open('', 'PRINT', 'width=800,height=600');

  My_Window.document.write('\
   <html>\
    <head>\
     <title>' + ((eMail.folders[ BID ].data[ MID ] || {}).Subject||"") + '</title>\
    </head>\
    <body>\
     <table>\
      <tr><td><b>De</b></td><td>' + ((eMail.folders[ BID ].data[ MID ] || {}).From||eMail.folders[ BID ].account.MAIL_Name||"") + '</td></tr>\
      <tr><td><b>Enviado</b></td><td>' + DateToString_ES( (eMail.folders[ BID ].data[ MID ] || {}).Date, "Short_Date" ) + '</td></tr>\
      <tr><td><b>Para</b></td><td>' + ((eMail.folders[ BID ].data[ MID ] || {}).To||"") + '</td></tr>\
      <tr><td><b>Asunto</b></td><td>' + ((eMail.folders[ BID ].data[ MID ] || {}).Subject||"") + '</td></tr>\
     </table>\
     <hr>\
     <div id="main">\
      ' + message + '\
     </div>\
    </body>\
   </html>');
  My_Window.document.close(); // necessary for IE >= 10
  My_Window.focus(); // necessary for IE >= 10*/
  setTimeout(function(){
    My_Window.print();
    if ( z ) 
      My_Window.close();
  },1000);
}
function review_eMails( Silent, xID, yID, zID ) {
         xID = xID || localStorage.getItem( 'CurrentAccount' ) || "";
         yID = yID || localStorage.getItem( 'CurrentMailBox' ) || "";
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var eMail  = eMails[ xID ] || JSON.parse( JSON.stringify( accountTemplate ) ),
       mBox  = eMail.folders[ yID ];

  var _Message = mBox.messages,
 _last_Message = mBox.last_Message;

  if ( _Message > _last_Message ) {

    _last_Message = 0; // Refresca la Lista de eMails desde el principio

    MAIL_CMD( "IN", "LIST_MAIL", _last_Message +" "+ ( 10 + _Message ) +"\" Mail_BOX=\""+ mBox[ "pathName" ], Get_MailLst,  Silent );

    mBox.last_Message = _Message;
    eMail.folders[ yID ] = mBox;
    eMails[ xID ] = eMail;
    localStorage.setItem( 'eMails', JSON.stringify( eMails ) );
  }
}
function Get_MailBox(e, xID, yID, zID, Silent) {
  var elm, eMail, Key = {}, Flags, Delimiter, PathName, Status, index, i = ["messages","unseen","recent"], x, y, z;
//    elm, eMail, Key = {}, Flags, Delimiter, PathName, Status, index, i = ["messages","unseen","recent"], x, y, z;

     xID = xID || localStorage.getItem( 'CurrentAccount' ) || "";
     yID = yID || localStorage.getItem( 'CurrentMailBox' ) || "";
     zID = zID || localStorage.getItem( 'CurrentMessage' ) || "";
  eMails = JSON.parse(localStorage.getItem('eMails')) || {};
    data = data_decode(e.data).split("\n");
  status = data_decode(e.status);
  
  if ( ! data.length )//&& ! Silent)
    return jQuery_confirm("info", "No Hay Carpetas o Buzones", "", "", "", "", "");

  var eMail = eMails[ xID ] || JSON.parse( JSON.stringify( accountTemplate ) );
      eMail.last_upDate = new Date().getTime();

  var  mBoxes = eMail.folders;

  for ( z = 0; z < mBoxes.length; z++ )
    Key[ mBoxes[ z ].pathName ] = z;

  i.forEach(function(e) {
    eMail[e] = 0;
  });
  data.forEach(function(elm) {
    if ( elm.split(" ")[1] == "LIST" ) {
      z         = (elm.split("(")[1]||"").split(")");
      Flags     = z[0].trim().split("\\").join("").split(" ");

      z         = (z[1]||"").trim().split(" ");
      Delimiter = (z[0]||"").split("\"").join("");
      PathName  = (z[1]||"").split("\"").join("");

      x         = status.indexOf( "* STATUS "+z[1] );
      z         = status.substr(x, status.substr(x).indexOf("\n"));
      Status    = (z.split(")")[0].split("(")[1]||"").split(" ");

      record    = {
        "pathName"    : PathName,
        "delimiter"   : Delimiter,
        "flags"       : Flags,
        "last_upDate" : new Date().getTime(),
        "last_Message": 0,
        "data"        : [],
        "size"        : 0,
        "sortBy"      : "Date",
        "reverse"     : true,
      };
      for ( index = 0; index < Status.length; index+=2 )
        record[ Status[ index ].toLowerCase() ] = parseInt( Status[ index + 1 ] ) || 0;

      index = Key[ PathName ];
      if ( index == undefined ) {
        index = mBoxes.push( record ) - 1;
      } else {
        ["last_Message","data","size","sortBy","reverse"]
        .forEach(function(e) {
          record[e] = mBoxes[ index ][e];
        });
        mBoxes[ index ] = record;
      }
      if ( PathName.toUpperCase() == "INBOX" )
        i.forEach(function(e) {
          eMail[e] += ( parseInt( mBoxes[ index ][e] ) || 0 )
        });
    };
  })
  eMails[ xID ] = eMail;
  localStorage.setItem( 'eMails', JSON.stringify( eMails ) );
  List_Box("end_of_loading", Silent);

  if ( yID )
    review_eMails( Silent, xID, yID, zID );
}
function Get_MailLst(e, xID, yID, zID, Silent) {
  var
   elm, exp, fetch, eMail, mBox, Key = {}, Message, first_Message = 999999999, last_Message = 0, head, data, Flag, ID, Content, x, y, z;

      xID = xID || localStorage.getItem( 'CurrentAccount' ) || "";
      yID = yID || localStorage.getItem( 'CurrentMailBox' ) || "";
   eMails = JSON.parse(localStorage.getItem('eMails')) || {};
      elm = e.data;

  if ( typeof elm == "string" ) {
    exp = /\n\* [0-9]+ FETCH /g;
    fetch = elm.match(exp)
    elm   = elm.split(exp);
    elm_first = elm.splice(0,1);
    elm[elm.length-1]=elm[elm.length-1].split("\nQUERY")[0];
  }

  if ( ! elm.length && ! Silent)
    return jQuery_confirm("info", "No Hay Nuevos Mensajes", "", "", "", "", "");

  eMail = eMails[ xID ] || JSON.parse( JSON.stringify( accountTemplate ) ),
  mBox  = eMail.folders[ yID ];

  mBox.last_upDate = new Date().getTime();

  for ( Key.UID = {}, Key.Message = {}, z = 0; z < mBox.data.length; z++ ) {
    Key.UID[ mBox.data[ z ].UID ] = z;
    Key.Message[ mBox.data[ z ].Message ] = z;
  }
  elm.forEach(function(json, index, array) {
    if ( typeof json == "object" ) {
      z = data_decode(json.data);
      z = z.split("\n");
      if ( z[z.length-1] != "." ) { z.pop(); }
      z[z.length-1] = "";
      Message = parseInt(json.mesg);

    } else {
      z = json.split("\n");
      Message = parseInt(fetch[ index ].split(" ")[1]);
    }
    if (  last_Message < Message )  last_Message = Message;
    if ( first_Message > Message ) first_Message = Message;

    head = z.splice(0,1)[0];
    data = z.join("\n");
    UID  = head.split("UID ")[1].split(" ")[0];
    Flag = head.split("FLAGS (")[1].split(")")[0];
    Flag = Flag.split("\\").join(" ").toUpperCase().trim();

    if ( Flag.length ) { Flag = " "+ Flag +" "; }

    if ( UID in Key.UID ) {
      ID = Key.UID[ UID ];
      Key.UID[ UID ] = -1;
      if ( Message != mBox.data[ ID ].Message ) {
        mBox.data.splice( Key.Message[ Message ], 1 );
      }
    } else {
      if ( Message in Key.Message ) {
        mBox.data.splice( Key.Message[ Message ], 1 );
      }
      ID = mBox.data.length;
    }
    if ( data ) {
      z = new get_eMailParser( data );
      data = z.message;

      z = document.createElement("div");
      z.innerHTML = data.content_TEXT || data.content_HTML || "";
      z = $( z );
      z.find("script").each(function() {
        z.html(z.html().split(this.outerHTML).join())
      })
      z.find("style").each(function() {
        z.html(z.html().split(this.outerHTML).join())
      })
      Content = z.text().replace(/(\s\s\s*)/g, ' \n');

      mBox.data[ ID ] = {
        "Message"    : Message,
        "Message-ID" : data.headers[ "message-id" ],
        "UID"        : UID,
        "From"       : utility.extractEncode_word(data.headers[ "from" ]),
        "To"         : utility.extractEncode_word(data.headers[ "to"   ]),
        "Date"       : new Date(data.headers.date).getTime(),
        "Subject"    : data.subject,
        "Content"    : Content,
        "Flag"       : Flag
      };
    }
  })
  mBox.data.forEach(function( e, index ) {
    if ( Key[ e.UID ] != -1 ) {
      Message = parseInt(e.Message);
      if ( first_Message > Message || last_Message < Message )
        mBox.data.splice( index, 1);
    }
  });
  eMails[ xID ].folders[ yID ] = mBox;
  Sort_eMails( false, xID, yID );
}
function Get_Attachment(selectUser) {
  var a = $("#Attachments"), h = a.find("#inputFiles"), x, y, z;
   e = h.find("input[type=file].available");
  if ( e.length == 1 ) {
    x = e[0].outerHTML.split('id="Attach_'), y = x[1].split('"');
    y[0] = (parseInt(y[0]) || 0) + 1;
    x[1] = y.join('"');
    h.append(x.join('id="Attach_'));
  } else {
    e = e.first();
  }
  return ( selectUser ) ? e.click() : e[0];
}
function Set_Attachment(e, evt) {
  evt = evt || event;
  var a = $("#Attachments"), h = a.find("#inputFiles"), size, und, x, y, z;
   
  if ( evt == "delete" ) {
    x = e.outerHTML.split('id="Ancor_'), y = x[1].split('"'),
    y = parseInt(y[0]) || 0;
    $(e).remove();
    $( "#Attach_" + y ).remove();
  } else {
    x = e.outerHTML.split('id="Attach_'), y = x[1].split('"'),
    y = parseInt(y[0]) || 0;
    for (x = 0, z = ""; x < e.files.length; x++ ) {
      var  size = e.files[x].size /  1024, und = "K";
      if ( size > 1000 )     size /= 1024, und = "M";
      z += e.files[x].name +' ('+ Math.round( size * 10) /10 +' '+ und+'B)<br>';
    };
    a.append('<a id="Ancor_'+ ( y ) +'" href="#" onclick="Set_Attachment(this,\'delete\')">'+ z +'</a>');
    e.classList.remove("available");
  }
  if ( h.find("input[type=file]").not(".available").length ) {
    a.css("display","");
  } else {
    a.css("display","none");
  }
}
function Set_eMails_Cookies(eMail) {
  Cookies("Write", "MAIL_Name"  ,eMail[ "MAIL_Name"  ] || "", 0, "");
  Cookies("Write", "MAIL_User"  ,eMail[ "MAIL_User"  ] || "", 0, "");

  if ( eMail[ "MAIL_Pswd"  ] )
    Cookies("Write", "MAIL_Pswd"  ,eMail[ "MAIL_Pswd"  ] || "", 0, "");

  Cookies("Write", "MAIL_Remind",eMail[ "MAIL_Remind"] || "", 0, "");

  Cookies("Write", "OUT_going"  ,eMail[ "OUT_going"  ] || "", 0, "");
  Cookies("Write", "OUT_Encryp" ,eMail[ "OUT_Encryp" ] || "", 0, "");
  Cookies("Write", "OUT_Auth"   ,eMail[ "OUT_Auth"   ] || "", 0, "");
  Cookies("Write", "OUT_Host"   ,eMail[ "OUT_Host"   ] || "", 0, "");
  Cookies("Write", "OUT_Port"   ,eMail[ "OUT_Port"   ] || "", 0, "");
  Cookies("Write", "OUT_User"   ,eMail[ "OUT_User"   ] || "", 0, "");

  if ( eMail[ "OUT_Pswd"  ] )
    Cookies("Write", "OUT_Pswd"   ,eMail[ "OUT_Pswd"   ] || "", 0, "");

  Cookies("Write", "IN_going"   ,eMail[ "IN_going"   ] || "", 0, "");
  Cookies("Write", "IN_Encryp"  ,eMail[ "IN_Encryp"  ] || "", 0, "");
  Cookies("Write", "IN_Auth"    ,eMail[ "IN_Auth"    ] || "", 0, "");
  Cookies("Write", "IN_Host"    ,eMail[ "IN_Host"    ] || "", 0, "");
  Cookies("Write", "IN_Port"    ,eMail[ "IN_Port"    ] || "", 0, "");
  Cookies("Write", "IN_User"    ,eMail[ "IN_User"    ] || "", 0, "");

  if ( eMail[ "IN_Pswd"  ] )
    Cookies("Write", "IN_Pswd"    ,eMail[ "IN_Pswd"    ] || "", 0, "");

  Cookies("Write", "MAIL_Encryp_Scheme",eMail[ "MAIL_Encryp_Scheme"] || "", 0, "");
  Cookies("Write", "MAIL_Auth_Scheme"  ,eMail[ "MAIL_Auth_Scheme"  ] || "", 0, "");
  Cookies("Write", "MAIL_XOAUTH_Token" ,eMail[ "MAIL_XOAUTH_Token" ] || "", 0, "");

  Cookies("Write", "MAIL_getMail"      ,eMail[ "MAIL_getMail"      ] || "", 0, "");
  Cookies("Write", "MAIL_getMail_Time" ,eMail[ "MAIL_getMail_Time" ] || "", 0, "");
  Cookies("Write", "MAIL_Keep"         ,eMail[ "MAIL_Keep"         ] || "", 0, "");
  Cookies("Write", "MAIL_Verbose"      ,eMail[ "MAIL_Verbose"      ] || "", 0, "");
  Cookies("Write", "MAIL_Verbose_Level",eMail[ "MAIL_Verbose_Level"] || "", 0, "");
  Cookies("Write", "MAIL_FQDN"         ,eMail[ "MAIL_FQDN"         ] || "", 0, "");
  Cookies("Write", "MAIL_FQDN_url"     ,eMail[ "MAIL_FQDN_url"     ] || "", 0, "");
}
function Reset_eMails(e) {
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};

  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) );

  if ( e ) {
    var mBox   = eMail.folders[ BID ];

//    eMail.messages -= mBox.messages;
//    eMail.recent   -= mBox.recent;
//    eMail.unseen   -= mBox.unseen;
//    eMail.size     -= mBox.size;

    mBox.data         = [];
    mBox.last_Message = 0;
//    mBox.messages     = 0;
//    mBox.recent       = 0;
//    mBox.unseen       = 0;
//    mBox.size         = 0;
    mBox.sortBy       = "Date";
    mBox.reverse      = true;

    eMail.folders[ BID ] = mBox;
    $( '#eMails_List' + AID +"-"+ BID ).html('');
    curr_BID = "";
  } else {
    eMail.folders = [];
    $( '#eMails_Box' + AID ).html('');
    curr_AID = "";
  }
  eMails[ AID ] = eMail;
  localStorage.setItem( 'eMails', JSON.stringify( eMails ) );

  if ( e ) {
    EMAIL_List_My_onLoad();
  } else {
    EMAIL_Box_My_onLoad();
  }
}
function Reset_eMails_Cookies() {
  Cookies("Remove", "MAIL_Name" );
  Cookies("Remove", "MAIL_User" );
  Cookies("Remove", "MAIL_Pswd" );
  Cookies("Remove", "MAIL_Remind" );

  Cookies("Remove", "OUT_going" );
  Cookies("Remove", "OUT_Encryp");
  Cookies("Remove", "OUT_Auth"  );
  Cookies("Remove", "OUT_Host"  );
  Cookies("Remove", "OUT_Port"  );
  Cookies("Remove", "OUT_User"  );
  Cookies("Remove", "OUT_Pswd"  );

  Cookies("Remove", "IN_going" );
  Cookies("Remove", "IN_Encryp");
  Cookies("Remove", "IN_Auth"  );
  Cookies("Remove", "IN_Host"  );
  Cookies("Remove", "IN_Port"  );
  Cookies("Remove", "IN_User"  );
  Cookies("Remove", "IN_Pswd"  );

  Cookies("Remove", "MAIL_Encryp_Scheme");
  Cookies("Remove", "MAIL_Auth_Scheme"  );
  Cookies("Remove", "MAIL_XOAUTH_Token" );

  Cookies("Remove", "MAIL_getMail" );
  Cookies("Remove", "MAIL_getMail_Time" );
  Cookies("Remove", "MAIL_Keep"    );
  Cookies("Remove", "MAIL_Verbose" );
  Cookies("Remove", "MAIL_Verbose_Level");
  Cookies("Remove", "MAIL_FQDN"    );
  Cookies("Remove", "MAIL_FQDN_url");
}
function Sort_eMails( option, xID, yID ) {
  xID = xID || localStorage.getItem( 'CurrentAccount' ) || "";
  yID = yID || localStorage.getItem( 'CurrentMailBox' ) || "";

  if ( option )
    eMails[ xID ].folders[ yID ].sortBy = option;

  var i = eMails[ xID ].folders[ yID ].sortBy;
  if ( eMails[ xID ].folders[ yID ].reverse ) {
    eMails[ xID ].folders[ yID ].data.sort( function( a, b ) {
      return 0 - a[ i ].toString().localeCompare(
                 b[ i ].toString() ) 
    });
  } else {
    eMails[ xID ].folders[ yID ].data.sort( function( a, b ) {
      return     a[ i ].toString().localeCompare(
                 b[ i ].toString() ) 
    });
  }
  localStorage.setItem( 'eMails', JSON.stringify( eMails ) );
  List_eMails("end_of_loading", false)
  List_eMails_icon();
}
function MAIL_CMD( ADDR, Command, ArgValue, CallBack, Silent ) {
  if ( ! UpdateForm ) return;

  var x, y, z,
   ID_Account = localStorage.getItem( 'CurrentAccount' ),
   ID_MailBox = localStorage.getItem( 'CurrentMailBox' ),
   ID_Message = localStorage.getItem( 'CurrentMessage' );

  login( ADDR, function () {
    if ( ! Silent ) {
      UpdateForm = false;
      lockScreen();
    }
    z = xSilent[ Command ], xSilent[ Command ] = Silent;
    if ( z != undefined )
      return;
console.log( ADDR, Command, ArgValue, Silent, z )

    var z = location.href.split("sinfonix"),
      url = z[0] + "sinfonix_sql.pl" + z[1].split(".pl")[1].split("#")[0];

    url += " MAIL_CMD=\"" + Command +"\"";
    url += " MAIL_ARGV=\"" + ArgValue +"\"";

    $.get({
      url: url,
      dataType: "json",
      jsonp: false

    }).done(function(data) {
      TMPswd[ AID + ADDR ] = "";
      if ( CallBack )
        if ( typeof( CallBack ) == "function" ) {
          CallBack( data, ID_Account, ID_MailBox, ID_Message, xSilent[ Command ] );
        } else {
          eval(CallBack);
        }

    }).fail(function(data) {
      if ( ! xSilent[ Command ] ) {
        var x, y, z;
        STDIO_error = "";
        x = (data.responseText.split("STDIO_error")[1]||"").split("\n")[0];
        if ( x ) {
          z = x.toUpperCase()

          if ( z.indexOf("AUTHENTICATIONFAILED")+1 || 
               z.indexOf("LOGIN")+1 ) {
            STDIO_error = 'Error en las Credenciales, verifique el nombre de Usuario y la contraseña, si la cuenta es de gMail lea el articulo de:<br><a href="https://support.google.com/accounts/answer/6010255?hl=es-419" target="_blank">Como activar el acceso de aplicaciones menos seguras</a>'

          } else if ( z.indexOf("[ALERT] APPLICATION-SPECIFIC PASSWORD REQUIRED")+1 ) {
            STDIO_error = 'Se requiere una contraseña de Aplicación, si la cuenta es de gMail lea el articulo de:<br><a href="https://support.google.com/accounts/answer/185833" target="_blank">Como crear y utilizar contraseñas de Aplicación</a>'

          } else if ( z.indexOf("CONNECTION RESET BY PEER")+1 ) {
            STDIO_error = 'Conexión Rechazada por el Servidor'

          } else if ( z.indexOf("CONNECTION TIME OUT")+1 ) {
            STDIO_error = 'Tiempo de espera agotado'

          } else if ( z.indexOf("HOST NO FOUND")+1 ) {
            STDIO_error = 'Servidor no Existe'

          } else if ( z.indexOf("NAME OR SERVICE UNKNOWN")+1 ) {
            STDIO_error = 'Nombre o Servicio Desconocido'

          } else {
            STDIO_error = x;
          }

        } else {
          x = document.createElement("div");
          x.innerHTML = data.responseText;
          y = x.querySelectorAll("script");
          if ( y.length ) {
            Object.keys( y ).forEach(function (i) {
              eval( y[i].innerHTML );
            });
          };
          if ( STDIO_error ) return;
          STDIO_error = data.responseText.substr(0,200);
        };
        jQuery_confirm("Error!","Error al ejecutar el comando: <br>"+ Command.trim() +"=\""+ ArgValue.trim()+"\"<br><br>Respuesta del Servidor:<br>"+ STDIO_error+"<br><br>", "", "", "", "", "");
      };

    }).always(function(data) {
      console.info( data );
      if ( ! xSilent[ Command ] ) {
        UpdateForm = true;
        lockScreen("unlock");
      };
      setTimeout(function() {
        try { xSilent[ Command ] = undefined; } catch (err) {};
      }, 500);
    });
  });
}
function textEditor(option) {
  editor = $( "[name=edit_eMail_Message]");
  editor.summernote('destroy');
  if ( option != "edit" )
    return ;
  
  editor.summernote({
    toolbar: [
      ['Style',     ['fontname','fontsize','bold','italic','underline',
                     'superscript','subscript' ]],                  // ,'strikethrough','clear'

      ['Color',     ['color']],                                     // ,'forecolor','backcolor'
      ['Paragraph', ['ol','ul','paragraph','style','height']],      // 
      ['Insert',    ['picture','link','video','table']],            // ,'hr'
      ['Misc',      ['fullscreen','codeview','help']]               // ,'undo','redo'
//    [groupName, [list of button]] ******* OJO NO BORRAR PARA EFECTOS DE CONSULTA ******
    ],
    focus: true,
    tabDisable: true,
    placeholder: 'Mensaje...',
    backColor: "red",
    airMode: parseInt( localStorage.getItem( "lit@Mail_edit" ) ) || 0,
    dialogsInBody: true,
    minHeight: "100%",
    maxHeight: null
//  width: 980,
//  height: WScreen_H-360,
  });
  editor.prop( "defaultValue", editor.val() );
}
function jQuery_Checked_val(item) {
  var z = $("[name="+item+"]:checked").val();
  return ( z ) ? z : "";
}
function Show() {
  $( '#MAIL_Remind').attr('disabled', ! $( "[name=MAIL_Pswd]" ).val() ).checkboxradio('refresh');

  var IN_AUTH = $( "[name=IN_Auth]   " ).val();
     OUT_AUTH = $( "[name=OUT_Auth]  " ).val();
    IN_ENCRYP = $( "[name=IN_Encryp] " ).val();
   OUT_ENCRYP = $( "[name=OUT_Encryp]" ).val();

  $( ".AUTH, .IN_USER, OUT_USER, .XOAUTH" ).hide();
  if ( IN_ENCRYP || IN_AUTH || OUT_ENCRYP || OUT_AUTH ) {
    $( ".AUTH" ).show();

    if ( IN_AUTH )
      $( ".IN_USER" ).show();

    if ( OUT_AUTH )
      $( ".OUT_USER" ).show();

    if ( ( IN_AUTH + OUT_AUTH ).indexOf( "XOAUTH" ) + 1 )
      $( ".XOAUTH" ).show();
  }
  if ( $( "#MAIL_Verbose" ).is( ":checked" ) ) {
    $( "#div_MAIL_Verbose_option" ).show()
  } else {
    $( "#div_MAIL_Verbose_option" ).hide()
  }
  if ( $( "#MAIL_getMail" ).is( ":checked" ) ) {
    $( "#div_MAIL_getMail_option" ).show()
  } else {
    $( "#div_MAIL_GetMail_option" ).hide()
  }
  if ( $( "#MAIL_FQDN" ).is( ":checked" ) ) {
    $( "#div_MAIL_FQDN_option" ).show()
  } else {
    $( "#div_MAIL_FQDN_option" ).hide()
  }
  if ( $( "[name=MAIL_Account]" ).val() ) {
    CurrentPage.find( "[name=check]"  ).closest("li").css('width','50%');
    CurrentPage.find( "[name=delete]" ).closest("li").css('display','');
//    CurrentPage.find( "[name=delete]" ).button('enable');
  } else {
    CurrentPage.find( "[name=check]"  ).closest("li").css('width','100%');
    CurrentPage.find( "[name=delete]" ).closest("li").css('display','none')
//    CurrentPage.find( "[name=delete]" ).button('disable');
  }
  CurrentPage.find( "[name=delete]" ).closest("div").trigger("refresh");
}
function showInput(e) {
 z = '#div_'+ e.id +'_option';
 if ( ( e.type=="checkbox" && e.checked ) ||
      ( e.type=="select-one"   && e[e.selectedIndex].value=='6E6F6E65' ) ) {
  $(z).show()
 } else {
  $(z).hide()
 }
}
function selectKnownServer() {
  var user = $("[name=MAIL_User]"), x, y
         z = (user.val().split("@")[1] || "").split("."),
        id = ( z[z.length-1].length < 3 ) ? z[z.length-3] : z[z.length-2];

  if ( id in KNOWSERVER ) {
    z = KNOWSERVER[id].OUT_going;
    if ( $("[name=OUT_Host]").val() != z.Host ) {

      x = $("[name=OUT_going]");
      x.each(function() {
        if ( this.value == z.protocol )
          this.checked = true;
      });
      x.checkboxradio("refresh");

      $("[name=OUT_Host]").val(z.Host);
      $("[name=OUT_Port]").val(z.Port);
      $("[name=OUT_User]").prop("placeholder",user.val());

      x = $("[name=OUT_Encryp]");
      x.find("[value="+z.Encryp+"]").prop("selected",true);
      x.selectmenu("refresh");

      x = $("[name=OUT_Auth]");
      x.find("[value="+z.Auth+"]").prop("selected",true);
      x.selectmenu("refresh");
    }
    z = KNOWSERVER[id].IN_going;
    if ( $("[name=IN_Host]").val() != z.Host ) {

      x = $("[name=IN_going]");
      x.each(function() {
        if ( this.value == z.protocol )
          this.checked = true;
      });
      x.checkboxradio("refresh");

      $("[name=IN_Host]").val(z.Host);
      $("[name=IN_Port]").val(z.Port);
      $("[name=IN_User]").prop("placeholder",user.val());

      x = $("[name=IN_Encryp]");
      x.find("[value="+z.Encryp+"]").prop("selected",true);
      x.selectmenu("refresh");

      x = $("[name=IN_Auth]");
      x.find("[value="+z.Auth+"]").prop("selected",true);
      x.selectmenu("refresh");
    }
    x = $("[name=MAIL_Encryp_Scheme]");
    x.find("[value="+KNOWSERVER[id].Encryp_scheme+"]").prop("selected",true);
    x.selectmenu("refresh");

    x = $("[name=MAIL_Auth_Scheme]");
    x.find("[value="+KNOWSERVER[id].Auth_scheme+"]").prop("selected",true);
    x.selectmenu("refresh");
  }
  Show();
}
function login( ADDR, CallBack ) {
  MAIL_Name = Cookies("Read",  "MAIL_Name");
  MAIL_User = Cookies("Read",  "MAIL_User");
  MAIL_Pswd = Cookies("Read",  "MAIL_Pswd");
       User = Cookies("Read", ADDR+"_User") || MAIL_User;
       Pswd = Cookies("Read", ADDR+"_Pswd") || MAIL_Pswd;

  if ( Pswd == "" || TMPswd[ AID + ADDR ] ) {
    if ( jQframeObj[ "EMAIL_login" ] )
      return

    AE = document.activeElement;
    jQframeObj[ "EMAIL_login" ] = $('\
      <div data-role="popup" id="EMAIL_login" data-theme="a" data-overlay-theme="b" data-dismissible="false"><center><div class="ui-btn ui-icon-lock ui-btn-icon-right ui-btn-b" style="text-align:left;margin: -1px -1px -1px -1px;">Iniciar Sesión</div><div data-role="main" class="ui-content"><h3>'+MAIL_Name+'<p><input style="position:absolute;width:0;height:0;border:0;" data-role="none"><input type="password" name="passwd" placeholder="'+User+'" style="text-align:center" class="ui-corner-all ui-shadow" autocomplete="new-password"><input style="position:absolute;width:0;height:0;border:0;" data-role="none"></h3></center></div></div>'

    ).popup({
      afterclose: function (e) {
        e.stopPropagation();
        windowFocus.pop();
        AE.focus();
        var z = jQframeObj[ "EMAIL_login" ];
        jQframeObj[ "EMAIL_login" ] = "";
//        z[0].querySelector("input[name=passwd]").onblur="";
        try {
          $( ":mobile-pagecontainer" ).pagecontainer( "getActivePage" )[0].style.display = "";
        } catch (err) { console.error(err) };
      },
//      history: false
        
    }).trigger( "create" ).popup( "open" );
    var z = jQframeObj[ "EMAIL_login" ].find( "[name=passwd]" );
    z[0].focus();
    z[0].select();
    z.on("blur"  , function() { this.focus();});
    z.on("change", function(evt) { login_CALLBACK( ADDR, CallBack, evt ) });
    windowFocus.push( "EMAIL_login" );
  } else {
    login_OK( CallBack );
  }
}
function login_CALLBACK( ADDR, CallBack, evt ) {
  evt = evt || event;
  TMPswd[ AID + ADDR ] = Cookies("Write", ADDR+"_Pswd", btoa(HTA( evt.target.value )), 0, "");
  jQframeObj[ "EMAIL_login" ].popup( "destroy" );
  login_OK( CallBack );
}
function login_OK( CallBack ) {
  if ( CallBack )
    if ( typeof( CallBack ) == "function" ) {
      CallBack();
    } else {
      eval(CallBack);
    }
}
function toggleEditor(e) {
  var toggle = parseInt( localStorage.getItem( 'lit@Mail_edit') ) || 0;
  if ( ! e )
    toggle = 1 - toggle;

  localStorage.setItem( 'lit@Mail_edit', toggle );
  List_eMails_icon();
}
function toggleOrder(e) {
  var toggle = parseInt( eMails[ AID ].folders[ BID ].reverse ) || 0;
  if ( ! e )
    toggle = 1 - toggle;

  eMails[ AID ].folders[ BID ].reverse = toggle;
  Sort_eMails();
}
function reLoadImages() {
         AID = localStorage.getItem( 'CurrentAccount' ) || "",
         BID = localStorage.getItem( 'CurrentMailBox' ) || "",
         MID = localStorage.getItem( 'CurrentMessage' ) || "",
      eMails = JSON.parse(localStorage.getItem('eMails')) || {};
  var eMail  = eMails[ AID ] || JSON.parse( JSON.stringify( accountTemplate ) ),
         UID = eMail.folders[ BID ].data[ MID ].UID, x, y, z;
  
      x = $( '#eMails_View'+ AID +"-"+ BID +"-"+ UID );
      y = x.html(); x.html(''); x.html(y);
}
function data_decode(data) {
  data = data || "";
  data = data.split("\u0008").join("\b");
  data = data.split("\u0009").join("\t");
  data = data.split("\u000A").join("\n");
  data = data.split("\u000C").join("\f");
  data = data.split("\u000D").join("")//\r");
//  data = data.split("\u0034").join("\"");
//  data = data.split("\u0092").join("\\");

//  data = data.split("\u0039").join("'");
//  data = data.split("\u0060").join("<");

  return data
}
function xss( m ) {
  if ( m ) {
    var tag = [ "!doctype", "html", "head", "body" ];
    tag.forEach(function(e) {
      m = m.split( "<" + e ).join( "<!--<![" + e +"]--><div" );
      m = m.split( "</"+ e ).join( "<!--<![/"+ e +"]--></div" );
      e = e.toUpperCase();
      m = m.split( "<" + e ).join( "<!--<![" + e +"]--><div" );
      m = m.split( "</"+ e ).join( "<!--<![/"+ e +"]--></div" );
    });
  }
  return m;
}
function ssx( m ) {
  if ( m ) {
    var tag = [ "!doctype", "html", "head", "body" ];
    tag.forEach(function(e) {
      m = m.split( "<!--<![" + e +"]--><div"  ).join( "<" + e );
      m = m.split( "<!--<![/"+ e +"]--></div" ).join( "</"+ e );
      e = e.toUpperCase();
      m = m.split( "<!--<![" + e +"]--><div"  ).join( "<" + e );
      m = m.split( "<!--<![/"+ e +"]--></div" ).join( "</"+ e );
    });
  };
  return m;
}
/** Rutinas para manejar la autenticacion via XOAUTH2 
 *  No esta bien implementada, Requiere REVISION!!!
 * 
function Auth_XOAUTH_GOOGLE(IO_going) {
  My_submit();
  var VALIDURL, OAUTHURL, SCOPE, CLIENTID, REDIRECT, TYPE, APP_PROMT, LOGIN_HINT, STATE, _url;
  VALIDURL   = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';

  OAUTHURL   = 'https://accounts.google.com/o/oauth2/auth?';

  SCOPE      = '';
  SCOPE     += ' https://mail.google.com';							// (Access to IMAP & SMTP Server)
  SCOPE     += ' email';
  SCOPE     += ' profile';
  SCOPE     += ' https://www.googleapis.com/auth/plus.me';			// (Know who you are on Google)
  SCOPE     += ' https://www.googleapis.com/auth/userinfo.email';	// (View your email address)
  SCOPE     += ' https://www.googleapis.com/auth/userinfo.profile'; // (View basic information about your account)

  CLIENTID   = '449055871565-33ohlrn627cphetugqtqj2mgj5f6mulr.apps.googleusercontent.com';
  REDIRECT   = 'http://localhost:8080/cgi-bin/sinfonix.pl?%5EOAUTH2_google.www'
  TYPE       = 'code';
  APP_PROMT  = 'force';
  LOGIN_HINT = $('[name='+IO_going+'_User]').val();
  STATE      = HTA('^EMAIL.www '+$('[name='+IO_going+'_User]').val())+'+guest';

  _url       = OAUTHURL + 'scope=' + SCOPE + '&client_id=' + CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE + '&approval_prompt=' + APP_PROMT + '&login_hint=' + LOGIN_HINT + '&state=' + STATE;

  login_XOAUTH( _url, IO_going );
 }

function login_XOAUTH( _url, IO_going ) {
  var win     = window.open( _url, "XOAUTH_login", 'width=500, height=500' ),
    pollTimer = window.setInterval( function() { 
      try {
        console.log(win.document.URL);
        if ( win.document.URL.indexOf( REDIRECT ) != -1 ) {
          window.clearInterval( pollTimer );
          var url = win.document.URL;
          acToken = gup( url, 'code' );
          $( '[name='+IO_going+'_XOAUTH_Token]' ).val( acToken );
          win.close();
        };
      } catch ( e ) {
        if ( win.closed )
          window.clearInterval( pollTimer );

        console.log(e);
      };
    }, 100);
}
function gup(url, name) {

  //credits: http://www.netlobo.com/url_query_string_javascript.html
  name = name.replace(/[[]/,"\[").replace(/[]]/,"\]");

  var regexS = "[\?&]"+name+"=([^&#]*)",
       regex = new RegExp( regexS ),
     results = regex.exec( url );

  return ( results == null ) ? "" : results[1];
}
**/
