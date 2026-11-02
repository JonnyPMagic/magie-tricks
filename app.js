
(function(){

  document.getElementById('yr').textContent = new Date().getFullYear();

  var ICON_LOCK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/><path d="M12 16.3v1.4"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>';
  var ICON_SPARKLE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C12.6 7.2 13.2 9.8 22 12 13.2 14.2 12.6 16.8 12 22 11.4 16.8 10.8 14.2 2 12 10.8 9.8 11.4 7.2 12 2Z"/></svg>';
  var ICON_WAND = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5 15 9"/><path d="M14 3c.35 1.7.9 2.25 2.6 2.6-1.7.35-2.25.9-2.6 2.6-.35-1.7-.9-2.25-2.6-2.6C13.1 5.25 13.65 4.7 14 3Z" fill="currentColor" stroke="none"/><path d="M19.8 8.6c.22 1.05.55 1.38 1.6 1.6-1.05.22-1.38.55-1.6 1.6-.22-1.05-.55-1.38-1.6-1.6 1.05-.22 1.38-.55 1.6-1.6Z" fill="currentColor" stroke="none"/></svg>';
  var ICON_CARDS = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="7" width="12" height="15" rx="2.5"/><rect x="9" y="2" width="12" height="15" rx="2.5"/></svg>';
  var ICON_CROWN = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l4.5 4L12 5l4.5 8L21 9l-2 9H5L3 9Z"/><circle cx="3" cy="9" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="5" r="1.15" fill="currentColor" stroke="none"/><circle cx="21" cy="9" r="1.15" fill="currentColor" stroke="none"/></svg>';
  var TIER_ICON = { beginner:ICON_WAND, advanced:ICON_CARDS, pro:ICON_CROWN, bonus:ICON_SPARKLE };

  /* ============================================================
     TRICK-KONFIGURATION
     -------------------------------------------------------------
     - tier: Anzeige-Label der Kategorie (Anfänger/Fortgeschritten/Profi)
     - title / sub: Anzeige-Text der Karte
     - videoEmbed: die komplette Embed-Player-URL des Videos (z.B. von
       Vimeo: "https://player.vimeo.com/video/XXXXXXX?h=XXXXXXXXXX" —
       steht im Vimeo-Teilen-Dialog unter "Einbetten"), oder null
       solange das Video noch nicht existiert
     - free: true = kein Code nötig
     - autoOnComplete + dependsOn: der Geheimtrick schaltet sich
       automatisch frei, sobald alle Tricks in dependsOn frei sind
       (kein eigener Code).

     Codes sind NICHT fest einem bestimmten Trick zugeordnet: jeder
     gültige, noch nicht benutzte 9-stellige Mystery-Machine-Code
     schaltet einfach den jeweils nächsten noch gesperrten Trick in
     dieser Reihenfolge frei (Anfänger → Fortgeschritten → Profi),
     egal ob auf dem Code "Anfänger", "Fortgeschritten" oder "Profi"
     stand. Die Liste der gültigen Codes (nur als Hash, nicht im
     Klartext) steht unten in CODE_MAP — die Klartext-Codes stehen in
     der codes-database.csv, die du separat bekommst, zum Drucken auf
     die Rückseite der Marken.
     ============================================================ */
  var TRICKS = [
    {
      id:'beginner', tier:'Anfänger', tierClass:'',
      title:'Das Seil, das sich selbst repariert', sub:'Code aus der Mystery Machine',
      teaser:'Ein Seil wird vor den Augen deines Publikums zerschnitten — und ist im nächsten Moment wieder ganz.',
      free:false, videoEmbed:'https://www.youtube.com/embed/kXxjmm6w2a8'
    },
    {
      id:'advanced', tier:'Fortgeschritten', tierClass:'mid',
      title:'[ Platzhalter: Fortgeschrittenen-Trick ]', sub:'Code aus der Mystery Machine',
      teaser:'[ Platzhalter: kurzer Teaser-Satz zu diesem Trick ]',
      free:false, videoEmbed:null
    },
    {
      id:'pro', tier:'Profi', tierClass:'hi',
      title:'[ Platzhalter: Profi-Trick ]', sub:'Code aus der Mystery Machine',
      teaser:'[ Platzhalter: kurzer Teaser-Satz zu diesem Trick ]',
      free:false, videoEmbed:null
    },
    {
      id:'bonus', tier:'Bonus', tierClass:'bonus',
      title:'[ Platzhalter: Geheimtrick ]', sub:'Automatisch freigeschaltet',
      teaser:'[ Platzhalter: kurzer Teaser-Satz zum Geheimtrick ]',
      free:false, videoEmbed:null,
      autoOnComplete:true, dependsOn:['beginner','advanced','pro']
    }
  ];

  /* CODE_MAP: SHA-256-Hash des 9-stelligen Codes -> Stufe, die auf dem
     Code aufgedruckt war ("beginner"/"advanced"/"pro" — nur zur
     Nachverfolgung/Statistik). Für die Freischalt-Logik zählt NUR, ob
     der Hash hier als Schlüssel existiert (= gültiger Code) — welcher
     Trick sich öffnet, wird stattdessen der Reihe nach bestimmt
     (siehe nextTrickToUnlock weiter unten), unabhängig von der Stufe.
     100 Codes für "Anfänger", 100 für "Fortgeschritten", 100 für "Profi"
     (Klartext-Listen: beginner-codes.csv / codes-database.csv).
     Weitere Codes jederzeit auf Zuruf nachgeneriert — einfach sagen, wie
     viele und für welche Stufe. */

  var CODE_MAP = {
      '76569f95166dd033109a6afba9cf9aee9e6971071b6e63d9517d7c597ccf6065': 'beginner',
      'e82a826895e79fb9c7c7dc501f888d10722790008d1fb9d69e4dcef433d5316e': 'beginner',
      '4ef18264d27656dd6e27f5c6accaaa9929681b72d4037bbc886b46f44edbb2f0': 'beginner',
      '8f623e7c11bda201e59f82644a86a9eb74621cebf959818f69dd5549b10a7ca7': 'beginner',
      '85501822c95580a5a458753c28e2f408268a069c0fb7bd3175f791aa31d301c6': 'beginner',
      'a710fe7a9014d742d4166804e1ca1a7becd0abd19fe269f34880247505c52173': 'beginner',
      'a3036aa9cf0ac9a192669f5c7db630014c9f50f658bdbff5585c13321d57f773': 'beginner',
      'd78cd49ee68fc361bfcd68505f592cfc7a5b64afd8892f8f36bc5a9e26e2a84e': 'beginner',
      '466f78cd83d384467472919e45ec1c9647de66893e86bb652c0c11af2fd1f375': 'beginner',
      'b2b80ed92a190a100d8ba7280aedf3a8c8df52cb6bc88f39ed3abd327a694a93': 'beginner',
      '24793cba3094f7a3381ae1d9d222fad596844dc5aeef7240917d4ac7d6fd194d': 'beginner',
      '32db8a87f9425222d74743595b988b3cc9cab2231edc230730bebb4a4df91ff0': 'beginner',
      '740563d83febbda283942f223877dc180d59eb4dee4407a47e9e2d38a2f22b90': 'beginner',
      '0ecd8765ff7b8204931efb44077d2279f866d291404362a4c3b136d41316c39a': 'beginner',
      '5e282669e7f1222fa03f5e90021816b2635934b69ba69a0147a747c9d988e2c3': 'beginner',
      '09428548cd678f23409f349db15cc32f26ca7cb0a15d160d20ff4d366ca14c77': 'beginner',
      '5d75530e4d1e73d4920e160c4f1c9379a6ea9bbd8d5301373833c2706853e0c6': 'beginner',
      'cfdc61efbf329f30acbe0000b45ac2f36b8b5ce43d01b7ff92fc575dc5d66a47': 'beginner',
      'a10b07ae0c5d91b59401144831201d2bbfb6e0ff661fd29f14b9ad3eeef72d3a': 'beginner',
      '6ded72cb6c48d23e449684e4f208e585b4a3f1ea1a49d01eb338feed0689c9f2': 'beginner',
      'f7243233ae8ef586514074332f5fefda7dc1666c31547884c25303840e91ec29': 'beginner',
      'd77c8dc9471a78f585b0bc56e5ab308d9998998e0dc3aef70e89fcda0d01da6b': 'beginner',
      'd5cf3a17f9abfbaedcef9085e9046ce6998ecbdb5110c8fb2230b623b6afe48b': 'beginner',
      'efd84d41586060b4c26d20d0e52688e9a4305f9079a923df009bcdcc93b4b600': 'beginner',
      '645261a07d56f1fa1ab2d363f1fed028fb9031c5c38e17378776f2253a686a4b': 'beginner',
      '835d6741e7c46f51fd849453784f66854973a477a9e0b45f673cb532241d1816': 'beginner',
      '0a817197acbce604317198f263f2d6eeeadd968fe0168c7a6682cc022888be00': 'beginner',
      'ab423f72dcb4fe5207be234779fe3c760da79af832047eef42117b7f6cf17260': 'beginner',
      '345c2ceb78bc9ca9d5be1935b029d3e731afee7b4f398a2ef1bf1dde5dab4e8e': 'beginner',
      '2e3bd729f873d79b0dd66d3aaee221dfe8bf3d343d9080912d8e41ff3c91610c': 'beginner',
      '307788894e0f860164599fb4d7eb5a85f229b750e1a4633345a2b5571231b767': 'beginner',
      '2519428e421aabfe756053fba2acea3e497fe06014ca72ea15594d8d59f8097f': 'beginner',
      '5fbb7ab3963ddf241e8fc7dc9765e854f928de80f7cfecdc767eb2fa8e523af6': 'beginner',
      'ed0ee90d83678b7a05311942ccb05adc6543327110e4072ebaa6f5cef8a0ce73': 'beginner',
      '0e8ccc370e88a1f026a4bb1dff0aab675c037c2c5d83520c2419290ba2e8576c': 'beginner',
      '684df9272dc9ad87ae7dc72404853ab0889f5f3799157b880dd63b97f00f1883': 'beginner',
      '65c156dd09df47927a6850cef00e8e52bd92a27f833724ea5395fe1fb2b76236': 'beginner',
      '62d5240a2da4540f7c3199bb521bdd5acc2dcd4f5763f3416b85bdae59a37ca7': 'beginner',
      '4cde3ac18d8546a2b79614df01d6524eaa79f83a873c283d78e4eb4fa23313e5': 'beginner',
      '7a2f82c44f7ecc68cdc696dc2b822c8e0108dd3eaf5f4a84ccd74d41f1a6b856': 'beginner',
      '3a23acd100bb37f1fb967d46caef98433b7f4d876c33cfe3eb481fabf1bf6d73': 'beginner',
      '402fdca883d69a9560d3b542f17e972549da7372ab555153749d93e203492037': 'beginner',
      '37f91d1b2bd7a165e2f8c0ae70c19270b41b430bc9f5bb2699c222d4328b4edb': 'beginner',
      '3f3447f85baf2d7e4440c4b05ab930d0e824055761858f58d9448b35bbfefd8b': 'beginner',
      '618f283c8b7a39086a1829cacdeadc5b14c5a874a90d46da18ca5098bd67c22f': 'beginner',
      'ce31074f4c7819722e037c8760190a489888a80cc8d799cebf3fa484be8308e1': 'beginner',
      '01af4300fd6e576548dabbdd5ec59a3a9c10bcd0efc87ebcb370d504896b9d5d': 'beginner',
      'f5fbd3870a626f64b2ff476e60b5d3d5cfddf4ed363e92b4ceae64c4ab026891': 'beginner',
      '16321d7bf394630074f7a6b180b32e0a46d6b6e0b7540f434310c0552fd5081c': 'beginner',
      'c752df0ce42f848844bff6f5f1890186131a8b236d4afbbc52bf71fb6478685f': 'beginner',
      'afe384332b3e3357b1c715e642078a50b7a25325fb113ce53ec37fe0eb18e1d8': 'beginner',
      'be36d5c8242e8a4ac61ca7c57e4f428b94dbaf5a90a3bf2de9aee628fd8812ec': 'beginner',
      '44f3d5692c2557b1a8258dc66c59417f830b56e0e8285189d6cece35d6b3d4ad': 'beginner',
      'c766e1ede2bafb258b6e7e759829dc38eab5879331cd0f34a9fe082562dffe9f': 'beginner',
      '1468a4d0f615cb608301b2e989147527bbc40737cd9c6abdcbee50038f29eeb1': 'beginner',
      'a5257fb7588abb57257ad89661c385b9199da2ed7901d98f19648ea887e3f929': 'beginner',
      '4d15e7f804ad21cc4bfba78fa1363e9e86592f8f6f1a8a50e0fcd05a031ef268': 'beginner',
      '4bbd5c4ebb97c60553f9e3fe2446e00857eba2af6f3f6c08e6d42a8c98c13f5f': 'beginner',
      '3cb752cca66d93a1949911c52b6732fafd31ef3f39d9af4f2eadef48032072b6': 'beginner',
      'e062e9ef70146a566306a9a718d16a316967ac10a5098add05a1261cfeb51b24': 'beginner',
      'c76f5aeba347f21dbd9ed886948e52cde0cede4a186095ca5f42680c7d5c39f5': 'beginner',
      'a112884a80e10319b1b7ce4db6413c6e6003ec29afcad2db4e33af72ec1eb934': 'beginner',
      '9b3fb88afab1faaaf962eb653a5332712c3b1b358ca9604554e69824af6cee51': 'beginner',
      '654389886bfa457f694b24f579e8dca6a270a08b3f7e07989e3a44142d9071d5': 'beginner',
      '20d2889c3f5b6276adec0a08ebc4bc902ac9056b66aa83f2e618363326a5da95': 'beginner',
      'a155770a0abfd6ec1a9f2a47afbf711ba7919b4b05191f6a98104690cf2af347': 'beginner',
      '47151e310472460db9e07455d9ddf77d002560f634ac1548d7a9336087405ed6': 'beginner',
      '302f1204b322d2fd69af0f37cf091671e09160f81397e5236f7ccebc5a79c7a6': 'beginner',
      '61379f6f6bfde7f4da8d78129def3b14f8e7ca246411ba2f160a66a6d85021f0': 'beginner',
      'a980b276c990782f7673455c239671405627faf64a04ef4dd0fbf3b760212f83': 'beginner',
      'b6a790427d51a622700865ace702219eb7613d4b873a095abf704dd8a38f0cb6': 'beginner',
      'e5a51784dc3af0e2c8bec8f0bea263bd676d6066ce41f7995512b1b1ef95e794': 'beginner',
      '88d9abb02bd1605ced9ab1c423561f1aeeb8d9677bb3adbcdc3630c1e4df0303': 'beginner',
      '2c7990de9c23e0c6853748ab5b67cba813f83a1f1cfecd83edd778aa318653e8': 'beginner',
      '9ef852a33cffc9e47ef7eea96e594124b4119aee8528e747c4ce633491cde43a': 'beginner',
      '131b16d83e76c5b6b836e60d5b5398e9a0c072e2b78ec6b2720456bbe82234f7': 'beginner',
      'f6bd3700a22c5edfd75221a68946b6a72fa0d6575a44c9ac20fa83f5b0058cff': 'beginner',
      '3b7629e9eeaf8c1b801eaea0d830f2dea0360cca78b9dc6d658bf905d085b996': 'beginner',
      '03c17f6989b5215e7fe323449c816727c7adcf983ed45510d61501e7301b87e8': 'beginner',
      'c9decdde0e0d942dfc708e4b3fc940b90200e2a6fde4e9ab69f8de31632aef17': 'beginner',
      '06f4a3294a6ebc0a65dada154532ea8436731644c3e614b1c1bb67169cea46fb': 'beginner',
      '94b258d9d47ba608572bb93e9b6e12a78154fb2f9d03776c241cecb8835e976c': 'beginner',
      'd5451f1aea9babfc2457578b209ed81074ca2a0a205c73226fc224efbb6ca984': 'beginner',
      'be1bb3a525a7196d7d6e027b90025e4dba6b565769b3727cc9ff8e28189e64e1': 'beginner',
      '914a1db82c215b81a6eb7dba62ed941ebbc6364c501108500f29c215a524a228': 'beginner',
      'f84b79138f361d9f2f69bd574d2cf62a3dd62b16a8928f0492134f066b1684f7': 'beginner',
      'cd49a0ce776dddf0eba6ead187be0ffe0941bc678572bb29df50140cc1257343': 'beginner',
      '698bc056a9f0264b332a54f5a0e45a76ebe31e17b542f422354f62bffd540060': 'beginner',
      'ce8bda8dfcb275e7d8e6c8437b5777ca628ed7f2446736aa50b3d5b2bbb93748': 'beginner',
      'd1ed05b148cdd8013924d3d12e1013bbf82838a0bb8ec66f2d7616e030765f16': 'beginner',
      'edd1052f5c5417abccdf45763fe954672e89ae38e6b98ccc156f13a4bca0a03b': 'beginner',
      '6e3098284680ece94e64d90cfb6d026998b4114459955eb4396ba98804ae8746': 'beginner',
      '77ac7e33a17af9cdc29d83e50b3768fd0a3a1682cc5cfad26c1df22b0b0a5023': 'beginner',
      '6389bc73587aae30458d77f8d9ea7d08f2e5852916e42e2deacd87e8a66c1c73': 'beginner',
      '1d7a891c6c434d1604726057eb62fcdf2da7ab2d42f24e1b6b390ffbf66039f0': 'beginner',
      '10fa23f940cd053ad0ac3a9ad0b2e1ee039b033165908a0b71eea0b99076525e': 'beginner',
      '5276148d9be04f415f6ac3f4a18ceb157c8ad3aae4b6ee5a0c0d308c94d5415d': 'beginner',
      '7db67fa143d12f034223e684e18f5459dd3afe10cff30235acd6e3437a146910': 'beginner',
      '59de8afb115525074bf98ad406f885e056bccdd7e2436d4f58606371fe27caa0': 'beginner',
      '1c985f1a07945d9e23fe4f958926c53cc0829c96d8fef50c88b94a699dcf1afa': 'beginner',
      '1f2376a9ccbcf8c6ec11ae18a87bcba8971e4a58148d5b12b84de20b73d23ee4': 'advanced',
      'd3203da432f8863d3681dd2e25c14ae50cec1ba5a097bf5e00f17136b1d3f0cf': 'advanced',
      '8e21b6ec8a6e3813c3f48a5616328b4985b3fc4a845563abc9f53cb2bfb543ba': 'advanced',
      'a84b04f68ea15973a055635257d282694714d4b90fcd2dcc254f5e37fe425454': 'advanced',
      'cd5af5eec950969d63fa2b75493fae0582dad52b2711274ee58ae9e34cdac460': 'advanced',
      'a6861b8c84f7a49bcdfec4ebecda6325a18ea90f14ac2395e80823cffaff21ae': 'advanced',
      '367cfb1d09c60e52a672dd35b38d986baac85f924f3457f85efb07bfe8f6435f': 'advanced',
      'cce560d45aa9f6f603377509a2b28250b5ef457d55c2885c2260943e9db27364': 'advanced',
      'dbccb18e0cdc996d063aeae92a36fec466c12b082d2319c5c3df7567bc98abce': 'advanced',
      '36474b2dccd0944ec99436fe1b3956c16611ac9e5a728bb30c221fd5e54d5385': 'advanced',
      '3c0dec7ff3e6331c6ff28e97a157625dcbb4427d915b32dc64731398a98b22ff': 'advanced',
      'd009b2be4d8e176d3920dfe685afdc13d21dfc021ed584e4c4fb9de8de78df06': 'advanced',
      '377d00a514d575f94ac5706c3ba4c38cb7af12d1a9646e48ee3c9105b6f15243': 'advanced',
      '2dbe8cda384c6731901d844ed4c9291d3fbeda351c3edbb48cb93f0f322efc6b': 'advanced',
      'b3ee90cee301f45967c857c88225fcd4cdaf8c3612afb86800ca4a0e6f6c71f1': 'advanced',
      '1222e03cf26b6a4fde268b1c4dd6cd90f2de12be0b0063726438d588df6ffa93': 'advanced',
      '9cc3bae11318aa40e552b10390dfe6ccd3ee591d7243b854e8a6dddee91045c1': 'advanced',
      '5f8fd27069669a75f0a2646fb7c51d9477c0e0b6d9a052d2a3a0bd50993b2f54': 'advanced',
      '477a8a96ee80993f21b9af832de960af0098be65b26eb92bf2c849fbd438a1e5': 'advanced',
      'a670401eff96e2339abe7c12575751e4cd712b9342eea48bb7d3bdfe981a7490': 'advanced',
      '7c6183ce78433cd17526f06e6671b6938a48c1a595b2a54b71b3ebc2277170a7': 'advanced',
      '973eed946130d555c9a4a460cb0b975058a6e4d9243f368ec199ec8c073efd75': 'advanced',
      '52c2bc765eae885b8b62b2292de2520e53d60c5a342a2b77dc21f171260718c4': 'advanced',
      'f2da2d9659fc1996dadbcc26a9b5dfd2866a76f23da7681536e1dc7ae61d9e46': 'advanced',
      '0e9f4fce6fdd74eea97ce290f247d32da70b022bfe2e98647295555b57695b95': 'advanced',
      '3461ae40d39eb6692f229d68f7dba75756f76c771f824ef54aa9d93055726667': 'advanced',
      '01278a73e085675b7692b6f2e23379588ac2c4598583fb31eab02c918e7c9826': 'advanced',
      'b4573461ac5474e4ce04566ba2336f47fcd56d3762d2f6fbd9deee46fea6a1db': 'advanced',
      '2b656bd9d27411857255dfa658b1b2067e6850d82d19fefe071a28c49bb3583a': 'advanced',
      '66df0d3d0ea68c4ae79ae3c3997ae3a784dd7899e6e9146e29cee64950549bf8': 'advanced',
      '5752e793d8f2c1c798c959d23721a2e76fb981deb8f5d2dd63c3081d0216a2d3': 'advanced',
      '4a9b9d75c3f71aba19f9372f4149555e5d2169526e3b87ce4375c99f0456d90c': 'advanced',
      '9583abb2eeb0edc591329d6a3a935aedb76d64ee8fb191668ac4a4b5a9ce34f6': 'advanced',
      'd60ada997a64cbb6c1f957da4cd70330307335fd12499668754c85be2022c803': 'advanced',
      '41ffe8e3e82bd172034dbc315b6b6f61981e209f3ac8269d2c6253e9e234e33a': 'advanced',
      '18e8d0310d7e013021d4749e93285be039f804acbeeaf0c2a5589ff6de4b471b': 'advanced',
      'c22dd944671cd48ac9b6d91b674fc552069374ef0229fcb39e1c2f0b7d279823': 'advanced',
      '6dc492542766318132d4605a0b0e9c8016dc105d1f8c196e37e97979044eb576': 'advanced',
      '8e3dd6b9761ad92d558a0d5248b2b6faa313081933be9f96e09454bc173817ae': 'advanced',
      '52396cf9782f02ff99c0bb1ed04245cdc4bfb1ef2495b4a6882694914da0d40f': 'advanced',
      '3bb6d81154c0ee133f67ba775ec70b5b255139fef33e97cd171167a8465d8214': 'advanced',
      '357c3594cfac6b79075c69ff1de8f779de38bf7c519abb37cdcb3f61edb5ceed': 'advanced',
      '712e1f746a36cf84952ba1e5e0850269ed21bf2d655c60e418e12706b1d22225': 'advanced',
      '1899f81afcd5369f6072bebedbc08c8bd59a16839faf4444799bbc2f03fdd183': 'advanced',
      'ab11ba6d33988b62256d668d0a683fb42e9306a8b2dfdb66dc95739323f8627c': 'advanced',
      'b7a4dbfa19dc417ebe16a118783d507fd1697d477f40d0e09da41502102664e0': 'advanced',
      'bb7e8292c77c9f1cbd7013c471afce4e300f327a7b753779f81f6d25ae377245': 'advanced',
      'c520e2e64574c64d4ac1abb43b355fa32fa3f465b7549746398cbcbb3cb3f84d': 'advanced',
      '577d74c021403aecc66a9a2bc835c758d70ac6942aabf3fd12f55b5c1f626e98': 'advanced',
      '7dcafb9b133351e7ab4cbd890fcb655278468e57692604e82f9ac533476f075f': 'advanced',
      '50f9653d4527b6fcecab31a27ddbc6c8d56e311c737c6d861f83d4a5433d149d': 'advanced',
      '1289c26a614e4f2e98098148e5914135b5fc2cf7fee190f07d28e3971ffcb165': 'advanced',
      '484adfa73dc993f2dc2c1b56d0e7fd9fab9e7ea692e76f5e11f0dfb98f2ba72b': 'advanced',
      'b303e87e7beb6aec42db24e82eee83dbac1bc8d7c9050ebb90ed8c144223e921': 'advanced',
      '96c7089962f208a5e702191b1b7abe779866dff357bdb6fbca62e5fa208ce1f5': 'advanced',
      '9e45665b3e382c98c09108b8ea04cdb2ad6e28b46640e717c090a57d8452472d': 'advanced',
      '2640c088cfbdb493aa6aeb4ad34bd9f0e82e3f40d1bef120ccdfc0a4c03f29b7': 'advanced',
      '09772851889a7a43f8a50c181a93773950d0e2d3159198ddd34de12556dc0731': 'advanced',
      'b396193e38ef1e46c7832e2a3be03fa1ac8effea2c743e42ac65f244af12f589': 'advanced',
      '3e4eac4d1e09fd1a85d2e0d56d560c3ed6ec9ab6e290f75e0d71ade2076c89db': 'advanced',
      'b9ac5b5734c1c03989849469b53b9b763c8d8020a7a15e3eae7ce09053a91aa9': 'advanced',
      'c8f8feb0073f8b6b6dcfc7bbb527f4d3c752ad8af3f99878f216c658c6de4b65': 'advanced',
      '5351db39cdb63970f6326e2569b7c4df47a97954a12fd372ecaea4fb108831d9': 'advanced',
      'ab40456df5bb568814e43d4532becec90edf2ce2dc202a8001f2f2d1b918ab7a': 'advanced',
      'de129061cd53f9ae708520424432bac009a54969511d6c5bfe6a23d6a958bdd7': 'advanced',
      '72edf2a4b4cc226162f5e886f063679c1ba7880748dd66c2dc961de411160c60': 'advanced',
      '3a7d976644ea4e992d089676e743891b8c3f9af8deb648025592dcc6774238a6': 'advanced',
      '42b529f2a4f0068a4c5cb56bb33d97901dda2a4c08b0c760f7c17595d50cc302': 'advanced',
      'bb353183e7a2cc97cf7ecdfeef1d56b316b56c3319959cb78273eb64d24969d1': 'advanced',
      '93b311bdb1195da345012cf886df9c46d6042989a1c0fc33e27beb6ff0c97487': 'advanced',
      '59f98eeea2eadd304d22587455892a8099ee5e6c3636883cc97d0d2474ca0197': 'advanced',
      'fa2a3a4106aeb0aef2f47164d3e6216f4fdebd88fb706f47c94cef183782ea62': 'advanced',
      '2a2a212aa1562e53c6ce637caf1e025e3dabaa0c952ea8e6ad20004a5b9d50bd': 'advanced',
      'f3324f1db0fa410d0b350abeac7f24eabcc01757f1542aaeada66a8eb52e1825': 'advanced',
      '633fe1dec6c05e60c87f3a79cdd30a8b392fe40f78ac3bab84fa8e96543409ae': 'advanced',
      '4136ee48aa774f93947132808fc9d4463ac436dc033726c10a6f94b1bd4e8fe7': 'advanced',
      'ae0c5fab5f5c299c9bdc9f05b95edd4bd80d400c6c99633bc83aac0ad52a998d': 'advanced',
      'c82c94de367f9a8115b6d633e2f73199f08ce143c05acbd89ba9a0c8dc1b6a95': 'advanced',
      '19ce82350755914d3d96e5a34e6d3530395cf103b9b8db039250bea3172df955': 'advanced',
      '5af67fa48d28fcadf3afb3880202a3388d7664f5cea09a43fb1614afe6de98cd': 'advanced',
      'f79a5761d43908d37b61041ba25223e1b7c2687b28d75008eed75798b05a40fe': 'advanced',
      '188ff85ada236877e9799ea8be54255f5c425b6a27cae2f8db1f7e256220dfb9': 'advanced',
      '7723585b09c98a3a1aa26e412211b4c602a9758f44cd4b97f6e8b0e910f71870': 'advanced',
      '87223861a7a3cb4473233225ba185cb9839c4ceced798ad869bbd34f570883bd': 'advanced',
      '32d716eea412bac1ae08776d59a3fab1c1a7cfc950e834cc066c509b9f53c6de': 'advanced',
      'cc6a82770b97f0c4f460201e0d0caf10f8669e26e60a7b084e79d95b24f46f0b': 'advanced',
      '2d541d7164d9184ef39c20ccf43405c95bb146a46d7a040c7909c216f0782b19': 'advanced',
      'e6af066c19178a0a0359151be278206f4ad688fde58135593bb5a580f7ab39b0': 'advanced',
      'd1135b223e02bd0ae8f615358e85c77a3bdcf9ab52ba7679ed5efc5218f4a753': 'advanced',
      '2138ab7e461d10641ee754b7791093315489b609af5318dee8613cc13d1a552e': 'advanced',
      '5e8c5fdca5aac8cbb70f84cf7017fc6c320869c326aa5180b3f6093d76d34aab': 'advanced',
      'b33a377f2ea3615153de8767d44aab3611ba6be6cefb024ac5b77f04fcae8d3a': 'advanced',
      'dbd5d7b856dca9cf1a42edbb772b97a7f5c625a6a6a656621f7eda5b70ead3e0': 'advanced',
      '36725f3dac8aaae87b99da540d46c8599c4dd6dc6597f8f9d008e50b5752770d': 'advanced',
      '7a5302b055af3d032cbc2f67b1b4f3af5ded30641ddaad08b9fb8251975e8152': 'advanced',
      '557565ec601f0d19c0164070c880402e2115615ccca9b89bc54d16640e7fefaf': 'advanced',
      '71bc6d553b36dad910bcbd3a664058c9fc2bd9de709b2f0be972c789da8e55cf': 'advanced',
      'a1cb6ada9040cbe85492a2b4dfeb6095876c36cc153de5ee966d9d13592308b4': 'advanced',
      '1d5818769e283e9556e669023b9184781eeb0788fc9d83825d6482b82997b2d7': 'advanced',
      '88be70411fab2cffa1ce308254b8e789d2aa6bb6c7dd02981ae2319e886d58e9': 'advanced',
      '4187908ce76d78d3cb1f267e281da4dffaec8154569fada644800e3eb0c1a216': 'pro',
      'bd114be269bbafe489c300d0edcbf56947c0b2f5c1764b5ef8ec7180872cdf38': 'pro',
      'f8fa149b0fef97be9ff9f8abebe24c1f5c56ad647e73e33a9f04c0a8ef98c6a6': 'pro',
      '3e7910abf2995d6f09ad5802ec7ece305b9b9a24415e4fdc5a14bfd696fdd760': 'pro',
      'a06fe93646b3b440121a14e75868808ab99a11a940a39b9f3a9f152aeccf7234': 'pro',
      '44935676d8eaf70380f4aa6dfbb4b11fe8a175005e507a776330ae4e630a321a': 'pro',
      '69ca227a49e6594d8d06c9cde0b76470523feea3b6fecd391e6fb24f0b504dd4': 'pro',
      '024a152597975720596378b1f8a9ebc3d1c6f1cb4c4c677756b62c47f2554fe9': 'pro',
      '046e4cfe8eb9363927e884e4e14763895e830ff121f444a6a0b6d1d1771a8c4c': 'pro',
      'd23972057bb8293a9d14498e3e5c7379f44ea6ee1184a44e2b101d6bf0daf49e': 'pro',
      '285fc054a0f2e8070b79b3ae2ba756bab6d92f151bc6965456b59e303a8eb6eb': 'pro',
      'db99e17e7d8c203e2685944ff720fc7e4ce4e1202e3589c8b6dacc228ea6b4ac': 'pro',
      'd89ba1a66265152c0f8212dcee03af1825d1e1c5e5f3129c4edfbc60fe62cf00': 'pro',
      '96af78b96412fd279750fb69e05e34afb40585079357b21094b06e237ff0a64b': 'pro',
      'dae6d3fb698034975028d2f311f39f342574a6c3393e81609d830f887e6b2df6': 'pro',
      '9e46ec9471f8393996c01af81a1d369f1822214bb95b1db43957940cfbf744a8': 'pro',
      '3fec8c56a6da4630b7ebb97dd8163948c973cae752ccc3d0a5150e6ee2e024fd': 'pro',
      '816e5c20d9c644635ab12ec58355d7f989db30b2493359e8d4c02aa3cfe56805': 'pro',
      'ca187f08c2923ea02f884c63d45544cdad238f343bc7be61f0c12f08f7e8a952': 'pro',
      'd1b053679ad8bd8530935f06282cb2afed1b339b2c7573d6713f2c895d4e771d': 'pro',
      'e6fa2f3d3c6875bb9ebac1e2d19571018f8b250ed765a3b173cf362877ddc9ae': 'pro',
      'c1ab6fff982acd4fc405e43e745f6812c8c1e36db1595914b358882988e77397': 'pro',
      'e790d7c089c04807301aeaab8a89164592e3d5f6b6a73510a4c0c774c0f5045c': 'pro',
      'f3d74888bcbe6d34e4f2e9e1ad831bc65486789d4cc987b3ea4b61ef55b28a78': 'pro',
      'd93a4432bf86464555b95d7c2a0b5e119845e6df6e6dfc127e925f9f01e095d9': 'pro',
      '37817ce62e0d6b86f49d4da29e240ab22541f5570db443e241a4285fc173161d': 'pro',
      'fcaa395923519b411d160a70e27379524244d07f0a2b469e186460120ed9331d': 'pro',
      'c0cd77573f74fbbe5c37ae13fbe551441c095af374d1706f55aad509c4bf487d': 'pro',
      '4c44aa17c35fa5ff0655d8cca4ea23626f469a769f8f1acec65ae1e81441a5c3': 'pro',
      'f00cc17f44cfc3d25e7f7a48d8e4e41bbc937ba9a6257ea780734c661cc2e26e': 'pro',
      '5e361c9961b6f5d6089e78c189ac0432f4d5566c72abff125e597bfd03e3785a': 'pro',
      'a8297f633d0a5116f27a158e87f7d35d2a706fd73185d99ca15b3cc3a7527eb7': 'pro',
      'bcfab2294bd35b23c501d312c208921c32b19e06e8181d19905484bdb9266289': 'pro',
      '0583a27fea106cdf867b0218d537f4f891fd4b177abf72d1c7bd33452566c4de': 'pro',
      'fb5c72b7c94eebdfd098bc970296dc9dd41562916782c98f44ff5d55dc2d0bbb': 'pro',
      'c5b596dfaa80aefeb6975bf2e5deac7b54000197c23ae74e093a58ea2f3a0abb': 'pro',
      'c4241b40b636fec19613d7bf86b30060b09b607f3775fb74de43dbfa9e7465e4': 'pro',
      '37d270ae53442f069e53783fe410d2ed03789f22a14e453d5657c1bc49f8e3ae': 'pro',
      '8d99424d1f6afbb7f27b58fb1985525f931b9cfa9f2fad0c540635a0bdff77f7': 'pro',
      'a7e52756e8adbcaea0e4e80b47569d3cad0c5abfb1e067b7ee468442ec1829ff': 'pro',
      '2e439e96cad78cbca72e20030f39a173032a6a8633703ec393f2de2892651ccd': 'pro',
      'a084e2ea089b68531a951736d83cbe6b4b704ff8541841a65bc34c5456bdb0c4': 'pro',
      'a0a383ec3838ad25b52eb192a0ac634d0f10abe4b409b1ab4485bf012de9bf45': 'pro',
      '52d0da5f337f7ad20e685a06abf814ff3fed5db74c31fe2b46c5c50f66c2e2fa': 'pro',
      '1319094394f93ee7531700257efd525002fef26670df2a002646f6358fe27acc': 'pro',
      'db3b8944a64a0ceef49a7e17ff5e79eaa226b5478027cf16738af721002cafb6': 'pro',
      'a81725f1792fdfa40405471528c98bdee010fea29bfabfec8d2583ef8533596f': 'pro',
      'bbcf23c18701c89acbd8001440828bf53411f2f95eda45874c33cd9a41a736c3': 'pro',
      'a192a378e29fd98e67ec705decdf3261cda3cbc64411365e7413b7736a50af4f': 'pro',
      '84ab0c9c422dab279847ea100159e86e2a62e338d582c35be7b3f3ae61ce85c8': 'pro',
      '922ed05c686ce1aa4262370d52cb6e94f7b0b7c550f47f2ad9c0f7ca1c8ed26d': 'pro',
      'fbbd03b4f43b6121fbbe0c7d38421f730e60af0f56e08e80cadb9d1acbae0162': 'pro',
      '9667792129e3b6c80785f5e4f67e8b68abcefc3ec1c137e85426aedd0ae5eccf': 'pro',
      'e9445799993d4a2a0e6ad549dfeff97c42ea6c363f3c98ab27e4ee019289653c': 'pro',
      '114438041d0113885b492c97f7ac04a287edd81b15377c498b465eef95420363': 'pro',
      '70bd1ca113265f1c3ed94a161df79e6220113a3dabb710b030b08feccde74656': 'pro',
      'e3c8d84d97c6325747bc629c3e6bf3a5e1db0faa82e345f5d6c9084946c0eea7': 'pro',
      '0aaa4530991ac84e9229dcbc5a7f8b394a46b93955bbba6ecabd76ace2e89a2c': 'pro',
      'd1ffac56d92d700e4bd734c8b10cee0b5e1dde47c8caea4344c179a37c9d80dd': 'pro',
      'bf27312d0b14da6b9949f2524ae2879175ab389f713b149cd3091ec67da4fd10': 'pro',
      '33c738ef7985b72fcdda54a105d5d206f2a1b606a7fba7c6569ce678e850686c': 'pro',
      'edd44be5032c9721b17821bf2d23f56c4bb905c5911cc39ca9857fb112dfb41d': 'pro',
      '513b1b2313a5e6ebedd0706a8d300de61fd482c6d7516c75bdda04dd58ab2b8c': 'pro',
      'f8f01daaba9ce412316584b259695882dd6c417200022f08ec2ec7a9a1e68593': 'pro',
      '6b049a7419361eb7fcc4b81e56c283029d5e1ef0fe6c42553c957e4674e6774a': 'pro',
      '7073f8ac66fabe9078f9987d26ce7b51eef53abb27d5b5bae415e270fc7f458e': 'pro',
      'aa028953dac2618fc24b10259ea1b69f2581a76ac0ab40f0b16fdca76bec830f': 'pro',
      'efbe4d995cd1d4a0f31512c366f28de9a5cc5cd113302799c1f965cd570ae0d9': 'pro',
      '49e8c284626cbb37778d3d6a5fe8ebc1b4a61ffb35fe5bfafd98a3b2c110693c': 'pro',
      '575b5b43c6b4e7143853aaff2700b8156bd74cef35d3d19b53def6ae7ffbed49': 'pro',
      'c1285d2c6568d8e9e11845c41e1356c75b567d8aa1e63cada851b2a72aad8347': 'pro',
      'd3473eb87fb4a1b1a693249a4bef5f153a71d0e8cb921deec7cad0d9d3a69c35': 'pro',
      '3dc12b931c82cdf166d8221b718f76429d9526686b2daa17cb1e65c9a2b99c2a': 'pro',
      'e9aa32bc8e409ac0e516c67f614e453c950ba4c1d992748e8e412ad277852160': 'pro',
      'de3ea4992ff49e98937ee4e29b05366b6af629d8dc92656689217048e7aa2878': 'pro',
      'b61c0c5a77a2d8f2b57bb9a8d78223552607d5a7f0df407e3755295767b5940c': 'pro',
      '1bc0b1da6b9e08707c05878f76b380a88ce5a296855bb12c88ed99904c865579': 'pro',
      '335106e9857e48c28366f4e16784034aca4cec5bb0501b36d73a0f24030361ed': 'pro',
      '086d10a8065484641f53ff59d85a4838a0e0d70c1959f333089ff4c2e01ff19c': 'pro',
      'c4dc2f25f510635616679b3b3251a3345dd566174dbc9d27519e9f63649e87a3': 'pro',
      '37f0fd05ebae7e6622522da71c97a8d687ec3ac5d03ba855855dc21aafb39572': 'pro',
      'e739e415caf805b84d700e18b2bf71fcbf26f31adac80bab6be747163c2bbf58': 'pro',
      '55ec0975e0b48b5b7d85996e89880bc2a2978d7129015724aea2f6010ec0ca2c': 'pro',
      '008f18e23b7d56a4512dffb5512ee1a6f411828461292fd22d6e8780a9be0f9f': 'pro',
      'b5b94c1879e85bcf4beffc4ac6ec1b040d75adde337bc1e5fc0c29ebef04ca0d': 'pro',
      '932bb6975ef0abd0f65204c2e280c391641240d4a5131ed87ffd0c0636c13d8f': 'pro',
      '17b04125f5b1aa0cc8851dbb30ad0ca10da0233a3de246479ce7816d290677c5': 'pro',
      '369e3980292d1af1a9e2aad6d7a65630b479702e4c50da5c067afc5bb449a779': 'pro',
      '2211b2d9c91fa099c721103c86f51627ee293401ea34860f4abc0a0dcdfc81bc': 'pro',
      'ba11c0ab4c738f46bde4f845ba222c9f720d5197bf4819fbc2238a5ed479e481': 'pro',
      '9d25b09ec545e85fbc5e2c1af49bcfaaf8d69f8c42c06b07e39224d3aa09fdac': 'pro',
      'ee993905a4da1cec814f3bda7eda4ac0cdb3b96c6b5ecdf4ee7c99d5cdb32f1c': 'pro',
      '60abc1de51df24e2d05c82d14970071d56cc33a2aaa8c3294f0245e5769393d7': 'pro',
      '32507bfe01e277b5b2645c90af7f9737279da8005cf8e949d86650e51f4b86cb': 'pro',
      '202155cb6f1ba3124365bb5d1b734d416e59befae4c1ed4aeb08c4a6db1da101': 'pro',
      '5097741ae815a747a3390a4a82a266e12d0f8151d05429294e92de1ea97780d9': 'pro',
      'b40081bf5ff4748eb10b0ab89baae72ea0b3bdb695b65f0dd6e6264bddc42b83': 'pro',
      'd228118dd298a398f4e607a88f67610c1a1594ac8140ac83ea16bdeff9c50550': 'pro',
      'f19e9011f7dcb53ddefda2fc9ea708a08cc3a7409d743bdf55aee6952012fd75': 'pro',
      '4256d6a224695bc81f47f4557513edba67bcd0f7e2d62a57a8256f6746ff98fe': 'pro',
    };

  var STORE_KEY = 'jpm_unlocked_tricks_v1';
  var REDEEMED_STORE_KEY = 'jpm_redeemed_codes_v1';

  function getUnlocked(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }catch(e){ return []; }
  }
  function setUnlocked(list){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(list)); }catch(e){}
  }

  /* Welche Code-Hashes in DIESEM Browser schon eingelöst wurden — nötig,
     weil Codes nicht mehr fest einem bestimmten Trick zugeordnet sind
     (siehe CODE_MAP-Kommentar): jeder NEUE, gültige Code schaltet einfach
     den jeweils nächsten noch gesperrten Trick frei, egal welche Stufe
     auf dem Code stand. Damit ein Code nicht mehrfach benutzt werden kann,
     um sich so durch mehrere Tricks zu "klicken", merken wir uns hier,
     welche Codes schon verbraucht sind. */
  function getRedeemedCodes(){
    try{ return JSON.parse(localStorage.getItem(REDEEMED_STORE_KEY) || '[]'); }catch(e){ return []; }
  }
  function setRedeemedCodes(list){
    try{ localStorage.setItem(REDEEMED_STORE_KEY, JSON.stringify(list)); }catch(e){}
  }

  /* Liefert die id des nächsten noch gesperrten Haupttricks (in der
     Reihenfolge in TRICKS: Anfänger → Fortgeschritten → Profi), oder
     null, wenn schon alle Haupttricks frei sind. Der Geheimtrick (bonus)
     zählt hier nicht mit — der schaltet sich automatisch frei. */
  function nextTrickToUnlock(unlocked){
    var main = TRICKS.filter(function(t){ return !t.autoOnComplete; });
    for(var i = 0; i < main.length; i++){
      if(unlocked.indexOf(main[i].id) === -1){ return main[i].id; }
    }
    return null;
  }

  /* Vorschau-Hilfe für Jonny: bewusst NICHT über einen URL-Parameter
     auslösbar (sowas könnte jeder erraten/teilen und sich damit alles
     gratis freischalten). Stattdessen nur per Hand über die Browser-
     Konsole aufrufbar (F12 bzw. Rechtsklick → "Untersuchen" → Konsole):
       jpmPreview.unlockAll()  → alle Tricks in diesem Browser freischalten
       jpmPreview.reset()      → wieder zurücksetzen (Tricks + Codes) */
  window.jpmPreview = {
    unlockAll: function(){
      setUnlocked(TRICKS.map(function(t){ return t.id; }));
      location.reload();
    },
    reset: function(){
      setUnlocked([]);
      setRedeemedCodes([]);
      location.reload();
    }
  };
  function isUnlocked(trick, unlocked){
    return trick.free || unlocked.indexOf(trick.id) !== -1;
  }

  async function sha256Hex(str){
    var enc = new TextEncoder().encode(str.trim().toUpperCase());
    var buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.prototype.map.call(new Uint8Array(buf), function(b){
      return b.toString(16).padStart(2,'0');
    }).join('');
  }

  /* ---------------- delight: sound + confetti ---------------- */
  var audioCtx = null;
  function ensureAudio(){
    try{
      if(!audioCtx){ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      if(audioCtx.state === 'suspended'){ audioCtx.resume(); }
    }catch(e){}
  }
  function playChime(big){
    if(!audioCtx) return;
    try{
      var now = audioCtx.currentTime;
      var notes = big ? [523.25, 659.25, 783.99, 1046.50, 1318.51] : [659.25, 880.00, 1174.66];
      notes.forEach(function(freq, i){
        var t = now + i * 0.09;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    }catch(e){}
  }

  function burstConfetti(big){
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce) return;
    var canvas = document.getElementById('confetti-canvas');
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ['#FFB224', '#F4F1E9', '#A6A49D'];
    var count = big ? 150 : 80;
    var particles = [];
    for(var i = 0; i < count; i++){
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 160,
        y: canvas.height * 0.24,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 9 - 3,
        size: 4 + Math.random() * 5,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        life: 0
      });
    }
    var last = performance.now();
    function frame(now){
      var dt = Math.min(32, now - last);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      particles.forEach(function(p){
        p.life += dt;
        if(p.life > 2200) return;
        alive = true;
        p.vy += 0.18;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 2200);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if(alive){ requestAnimationFrame(frame); }
      else{ ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
    requestAnimationFrame(frame);
  }

  function celebrate(big){
    playChime(big);
    burstConfetti(big);
  }

  /* ---------------- Beschwörungs-Moment (code -> sigil summoning) ---------------- */
  function buildSigilSVG(code){
    var chars = [];
    for(var i = 0; i < code.length; i++){ chars.push(code.charCodeAt(i)); }
    var sum = chars.reduce(function(a, b){ return a + b; }, 0);
    var pointCount = 6 + (sum % 4); // 6..9 points, deterministic per code
    var cx = 100, cy = 100, r = 68;
    var rotOffset = (sum % 360) * (Math.PI / 180);
    var points = [];
    for(var p = 0; p < pointCount; p++){
      var angle = rotOffset + p * (2 * Math.PI / pointCount);
      points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }

    var seq = chars.map(function(c){ return c % pointCount; });
    var path = [];
    for(var s = 0; s < seq.length; s++){
      if(path.length === 0 || path[path.length - 1] !== seq[s]){ path.push(seq[s]); }
    }
    if(path.length < 3){ path = [0, Math.floor(pointCount / 2), pointCount - 1]; }
    path.push(path[0]); // close the loop

    var parts = [];
    parts.push('<circle class="seal-ring" cx="100" cy="100" r="' + r + '" style="animation-delay:0ms"></circle>');
    parts.push('<circle class="seal-ring" cx="100" cy="100" r="' + (r + 14) + '" style="animation-delay:90ms"></circle>');

    var lineStart = 280, perLine = 130;
    for(var m = 0; m < path.length - 1; m++){
      var a = points[path[m]], b = points[path[m + 1]];
      var len = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) || 0.01;
      var delay = lineStart + m * perLine;
      parts.push(
        '<line class="seal-line" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
        '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) +
        '" style="stroke-dasharray:' + len.toFixed(1) + ';stroke-dashoffset:' + len.toFixed(1) +
        ';animation-delay:' + delay + 'ms"></line>'
      );
    }
    var nodeStart = lineStart + (path.length - 1) * perLine;
    points.forEach(function(pt, idx){
      parts.push('<circle class="seal-node" cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="3.4" style="animation-delay:' + (nodeStart + idx * 40) + 'ms"></circle>');
    });
    var flashDelay = nodeStart + pointCount * 40 + 100;
    parts.push('<circle class="seal-flash" cx="100" cy="100" r="70" style="animation-delay:' + flashDelay + 'ms"></circle>');

    return { svg: parts.join(''), duration: flashDelay + 520 };
  }

  function playSummonTone(durationMs){
    if(!audioCtx) return;
    try{
      var now = audioCtx.currentTime;
      var dur = Math.max(0.2, durationMs / 1000);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + dur);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    }catch(e){}
  }

  function playSummoning(code, onComplete){
    var stage = document.getElementById('seal-stage');
    var svgEl = document.getElementById('seal-svg');
    var caption = document.getElementById('seal-caption');
    if(!stage || !svgEl){ onComplete(); return; }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var built = buildSigilSVG(code);
    var duration = reduce ? 150 : built.duration;

    svgEl.innerHTML = reduce ? '' : built.svg;
    stage.hidden = false;
    caption.textContent = 'Beschwörung läuft …';
    redeemInput.disabled = true;
    redeemBtn.disabled = true;

    if(!reduce){ playSummonTone(duration); }

    setTimeout(function(){
      stage.hidden = true;
      svgEl.innerHTML = '';
      redeemInput.disabled = false;
      redeemBtn.disabled = false;
      onComplete();
    }, duration);
  }

  /* ---------------- media / progress rendering ---------------- */
  function mediaBlock(trick){
    if(trick.videoEmbed){
      return '<div class="media"><iframe src="' + trick.videoEmbed +
        '" title="' + trick.title +
        '" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" allowfullscreen loading="lazy"></iframe></div>';
    }
    return '<div class="media placeholder"><span class="ic">' + ICON_PLAY + '</span><p>Video folgt in Kürze</p></div>';
  }

  function renderProgress(unlocked){
    var main = TRICKS.filter(function(t){ return !t.autoOnComplete; });
    var doneCount = main.filter(function(t){ return isUnlocked(t, unlocked); }).length;
    var pct = Math.round((doneCount / main.length) * 100);
    document.getElementById('progress-count').textContent = doneCount + ' / ' + main.length + ' Tricks';
    document.getElementById('progress-fill').style.width = pct + '%';

    var note = document.getElementById('progress-note');
    var bonus = TRICKS.filter(function(t){ return t.autoOnComplete; })[0];
    var bonusUnlocked = bonus && unlocked.indexOf(bonus.id) !== -1;

    note.classList.remove('hot');
    if(bonusUnlocked){
      note.textContent = 'Alles freigeschaltet, inklusive Geheimtrick. Trick-Profi-Status erreicht.';
      note.classList.add('hot');
    } else if(doneCount >= main.length){
      note.textContent = 'Alle Haupttricks frei — irgendwo hier versteckt sich noch mehr …';
      note.classList.add('hot');
    } else if(doneCount === main.length - 1){
      note.textContent = 'Fast geschafft, nur noch ein Code fehlt.';
    } else {
      note.textContent = 'Hol dir einen Code an der Mystery Machine, um mehr freizuschalten.';
    }
  }

  var firstRender = true;
  function render(justUnlockedId){
    var unlocked = getUnlocked();

    // check bonus auto-unlock
    var bonus = TRICKS.filter(function(t){ return t.autoOnComplete; })[0];
    var bonusJustUnlocked = false;
    if(bonus && unlocked.indexOf(bonus.id) === -1){
      var depsMet = bonus.dependsOn.every(function(depId){
        var dt = TRICKS.filter(function(t){ return t.id === depId; })[0];
        return isUnlocked(dt, unlocked);
      });
      if(depsMet){
        unlocked.push(bonus.id);
        setUnlocked(unlocked);
        bonusJustUnlocked = true;
      }
    }

    renderProgress(unlocked);

    var list = document.getElementById('list');
    list.innerHTML = '';

    TRICKS.forEach(function(trick, trickIdx){
      var unlockedNow = isUnlocked(trick, unlocked);
      var card = document.createElement('div');
      card.className = 'card ' + (unlockedNow ? 'is-unlocked' : 'is-locked') + (trick.autoOnComplete ? ' is-bonus' : '');
      card.id = 'card-' + trick.id;
      if(firstRender){
        card.classList.add('reveal');
        card.style.transitionDelay = (Math.min(trickIdx, 7) * 70) + 'ms';
      }

      var pillClass = trick.free ? 'free' : (trick.autoOnComplete ? 'secret' : (unlockedNow ? 'unlocked' : 'locked'));
      var pillText = trick.free ? 'Frei' : (unlockedNow ? (trick.autoOnComplete ? 'Enthüllt' : 'Freigeschaltet') : (trick.autoOnComplete ? 'Geheim' : 'Gesperrt'));
      var isPlaceholderTitle = /Platzhalter/.test(trick.title);

      var isSecret = trick.autoOnComplete && !unlockedNow;
      var numLabel = isSecret ? '?' : (trickIdx + 1 < 10 ? '0' : '') + (trickIdx + 1);
      var html = '';
      html += '<div class="card-side">';
      html += '  <div class="card-no" aria-hidden="true">' + numLabel + '</div>';
      html += '  <div class="tier">' + (isSecret ? ICON_SPARKLE : TIER_ICON[trick.id]) + '<span>' + (isSecret ? '???' : trick.tier) + '</span></div>';
      html += '  <div class="state-pill ' + pillClass + '">' + pillText + '</div>';
      html += '</div>';
      html += '<div class="card-main">';
      html += '  <h3>' + (isSecret ? 'Geheimtrick' : trick.title) + '</h3>';
      html += '  <div class="sub">' + (isSecret ? 'Schalte alle anderen Tricks frei' : trick.sub) + '</div>';
      if(!isSecret && trick.teaser){
        html += '  <p class="teaser">' + trick.teaser + '</p>';
      }

      if(unlockedNow){
        html += mediaBlock(trick);
      } else if(trick.autoOnComplete){
        html += '<div class="media locked-media"><div class="lock-ic">' + ICON_SPARKLE + '</div><p>Wird automatisch enthüllt, sobald du Anfänger, Fortgeschritten &amp; Profi frei hast.</p></div>';
      } else {
        html += '<div class="media locked-media" id="lockedmedia-' + trick.id + '"><div class="lock-ic">' + ICON_LOCK + '</div><p>Mit 9-stelligem Code oben freischalten</p></div>';
      }

      if(isPlaceholderTitle && (unlockedNow || !trick.autoOnComplete)){
        html += '<div class="placeholder-note">Demo-Inhalt — hier kommen echter Titel &amp; Video rein, sobald verfügbar.</div>';
      }
      html += '</div>';

      card.innerHTML = html;
      list.appendChild(card);

      if(trick.id === justUnlockedId){
        card.classList.add('reveal-flash');
        setTimeout(function(){ card.classList.remove('reveal-flash'); }, 950);
      }
    });

    if(bonusJustUnlocked){
      var bcard = document.getElementById('card-' + bonus.id);
      if(bcard){
        setTimeout(function(){
          bcard.classList.add('reveal-flash');
          celebrate(true);
          setTimeout(function(){ bcard.classList.remove('reveal-flash'); }, 950);
        }, 120);
      }
    }

    if(typeof renderIdCard === 'function'){ renderIdCard(unlocked); }
    firstRender = false;
  }

  /* ---------------- universal code redemption ---------------- */
  var redeemInput = document.getElementById('redeem-input');
  var redeemForm = document.getElementById('redeem-form');
  var redeemMsg = document.getElementById('redeem-msg');
  var redeemBtn = redeemForm.querySelector('button');

  redeemInput.addEventListener('input', function(){
    var raw = redeemInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    var grouped = raw.match(/.{1,3}/g) || [];
    redeemInput.value = grouped.join('-');
  });

  redeemForm.addEventListener('submit', async function(ev){
    ev.preventDefault();
    ensureAudio();
    var raw = redeemInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    redeemMsg.className = 'msg';
    redeemMsg.textContent = '';

    if(raw.length !== 9){
      redeemMsg.className = 'msg error';
      redeemMsg.textContent = 'Der Code hat 9 Zeichen (Format XXX-XXX-XXX).';
      return;
    }

    var hash = await sha256Hex(raw);

    if(!CODE_MAP.hasOwnProperty(hash)){
      redeemMsg.className = 'msg error';
      redeemMsg.textContent = 'Unbekannter Code — bitte nochmal prüfen und erneut eingeben.';
      redeemForm.classList.remove('shake'); void redeemForm.offsetWidth; redeemForm.classList.add('shake');
      return;
    }

    var redeemed = getRedeemedCodes();
    if(redeemed.indexOf(hash) !== -1){
      redeemMsg.className = 'msg success';
      redeemMsg.textContent = 'Dieser Code wurde bereits eingelöst — scroll runter, um deinen Fortschritt zu sehen.';
      redeemInput.value = '';
      return;
    }

    var unlocked = getUnlocked();
    var trickId = nextTrickToUnlock(unlocked);

    if(!trickId){
      redeemed.push(hash);
      setRedeemedCodes(redeemed);
      redeemMsg.className = 'msg success';
      redeemMsg.textContent = 'Du hast bereits alle Tricks freigeschaltet — dieser Code wird nicht mehr gebraucht.';
      redeemInput.value = '';
      return;
    }

    var trick = TRICKS.filter(function(t){ return t.id === trickId; })[0];

    redeemed.push(hash);
    setRedeemedCodes(redeemed);
    unlocked.push(trickId);
    setUnlocked(unlocked);
    redeemMsg.className = 'msg success';
    redeemMsg.textContent = 'Code erkannt — die Beschwörung beginnt …';
    var codeForSeal = raw;
    redeemInput.value = '';

    playSummoning(codeForSeal, function(){
      redeemMsg.textContent = 'Richtig! „' + trick.tier + '" wird freigeschaltet …';
      celebrate(false);
      setTimeout(function(){
        render(trickId);
        var newCard = document.getElementById('card-' + trickId);
        if(newCard && newCard.scrollIntoView){ newCard.scrollIntoView({ behavior:'smooth', block:'center' }); }
      }, 400);
    });
  });

  /* ---------------- Sprachnachricht (voice note player) ---------------- */
  // Sobald Jonny eine Audiodatei schickt, hier den Data-URL-String eintragen
  // (z.B. "data:audio/mpeg;base64,..."). Leer = Platzhalter wird angezeigt.
  var VOICE_AUDIO_SRC = 'media/sprachnachricht.mp3';

  (function initVoiceNote(){
    var btn = document.getElementById('voice-note-btn');
    var waveEl = document.getElementById('voice-note-wave');
    var timeEl = document.getElementById('voice-note-time');
    var labelEl = document.getElementById('voice-note-label');
    var audio = document.getElementById('voice-note-audio');
    if(!btn || !waveEl || !audio) return;

    var iconPlay = btn.querySelector('.icon-play');
    var iconPause = btn.querySelector('.icon-pause');

    // dekorative, deterministisch erzeugte Pseudo-Waveform
    var barCount = 40;
    var bars = [];
    for(var i = 0; i < barCount; i++){
      var rnd = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
      var bar = document.createElement('span');
      bar.className = 'voice-note-bar';
      bar.style.height = (30 + rnd * 70).toFixed(0) + '%';
      waveEl.appendChild(bar);
      bars.push(bar);
    }

    function formatTime(sec){
      if(!isFinite(sec) || sec < 0) sec = 0;
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    if(!VOICE_AUDIO_SRC){
      btn.disabled = true;
      labelEl.textContent = 'Sprachnachricht von Jonny folgt in Kürze';
      return;
    }

    audio.src = VOICE_AUDIO_SRC;

    audio.addEventListener('loadedmetadata', function(){
      timeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', function(){
      var activeCount = audio.duration ? Math.round((audio.currentTime / audio.duration) * barCount) : 0;
      bars.forEach(function(bar, idx){ bar.classList.toggle('is-active', idx < activeCount); });
      timeEl.textContent = formatTime(audio.duration - audio.currentTime);
    });
    audio.addEventListener('ended', function(){
      waveEl.classList.remove('is-playing');
      btn.classList.remove('is-playing');
      iconPlay.classList.remove('is-hidden');
      iconPause.classList.add('is-hidden');
      bars.forEach(function(bar){ bar.classList.remove('is-active'); });
      timeEl.textContent = formatTime(audio.duration);
    });

    btn.addEventListener('click', function(){
      if(audio.paused){
        audio.play().catch(function(){});
        waveEl.classList.add('is-playing');
        btn.classList.add('is-playing');
        iconPlay.classList.add('is-hidden');
        iconPause.classList.remove('is-hidden');
      } else {
        audio.pause();
        waveEl.classList.remove('is-playing');
        btn.classList.remove('is-playing');
        iconPlay.classList.remove('is-hidden');
        iconPause.classList.add('is-hidden');
      }
    });
  })();

  /* ---------------- Zauberausweis (ID card generator) ---------------- */
  var EPITHETS = [
    'Kartenflüsterer', 'Meister der Täuschung', 'Blitzhand', 'Phantom der Bühne',
    'Herrscher der Illusion', 'Verblüffungskünstler', 'Geisterhand', 'Trickspezialist',
    'Bühnenzauberer', 'Illusionsjäger', 'Kartenzauberer', 'Rätsel der Bühne',
    'Verwandlungskünstler', 'Meister des Unmöglichen', 'Zaubergenie', 'Schatten der Magie'
  ];
  var PASSPORT_KEY = 'jpm_passport_v1';
  var PLACEHOLDER_AVATAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  var WAND_ICON_SVG = '<svg viewBox="0 0 24 24"><line x1="5" y1="20" x2="14.8" y2="9.2" stroke="currentColor" opacity="0.35" stroke-width="2.6" stroke-linecap="round"/><line x1="14.3" y1="9.7" x2="18.3" y2="5.3" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>';
  var CHECK_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>';
  var DOT_ICON_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';

  function loadPassport(){
    try{ return JSON.parse(localStorage.getItem(PASSPORT_KEY) || 'null'); }catch(e){ return null; }
  }
  function savePassport(p){
    try{ localStorage.setItem(PASSPORT_KEY, JSON.stringify(p)); }catch(e){}
  }
  function randomEpithet(exclude){
    var pool = EPITHETS.filter(function(e){ return e !== exclude; });
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function genMemberNumber(){
    var year = new Date().getFullYear();
    var n = Math.floor(1000 + Math.random() * 9000);
    return 'JPM-' + year + '-' + n;
  }
  function rankForUnlocked(unlocked){
    var bonus = TRICKS.filter(function(t){ return t.autoOnComplete; })[0];
    if(bonus && unlocked.indexOf(bonus.id) !== -1) return 'Geheimnisträger';
    if(unlocked.indexOf('pro') !== -1) return 'Profi';
    if(unlocked.indexOf('advanced') !== -1) return 'Fortgeschritten';
    return 'Anfänger';
  }

  var passport = loadPassport() || {
    nick: '', photo: null, epithet: randomEpithet(), number: genMemberNumber(),
    since: new Date().toLocaleDateString('de-DE')
  };
  savePassport(passport);

  function renderIdCard(unlocked){
    unlocked = unlocked || getUnlocked();
    document.getElementById('idcard-rank').textContent = rankForUnlocked(unlocked);
    document.getElementById('idcard-nick').textContent = passport.nick || 'Dein Name';
    document.getElementById('idcard-epithet').textContent = '„' + passport.epithet + '"';
    document.getElementById('idcard-number').textContent = passport.number;
    document.getElementById('idcard-since').textContent = passport.since;

    var photoEl = document.getElementById('idcard-photo');
    photoEl.innerHTML = '';
    if(passport.photo && /^data:image\//.test(passport.photo)){
      var photoImg = document.createElement('img');
      photoImg.alt = '';
      photoImg.src = passport.photo;
      photoEl.appendChild(photoImg);
    } else {
      photoEl.innerHTML = PLACEHOLDER_AVATAR;
    }

    var main = TRICKS.filter(function(t){ return !t.autoOnComplete; });
    var doneCount = main.filter(function(t){ return isUnlocked(t, unlocked); }).length;
    var wandsEl = document.getElementById('idcard-wands');
    wandsEl.innerHTML = '';
    for(var i = 0; i < main.length; i++){
      var w = document.createElement('span');
      w.className = 'idcard-wand' + (i < doneCount ? ' on' : '');
      w.innerHTML = WAND_ICON_SVG;
      wandsEl.appendChild(w);
    }

    var bonus = TRICKS.filter(function(t){ return t.autoOnComplete; })[0];
    var bonusDone = bonus && unlocked.indexOf(bonus.id) !== -1;

    var nick = passport.nick || 'Zauberlehrling';
    document.getElementById('idcard-back-msg').textContent =
      bonusDone ? ('Respekt, ' + nick + '! Du hast alles gemeistert — inklusive dem Geheimtrick.')
                : ('Danke, dass du dabei bist, ' + nick + '!');

    var checklistEl = document.getElementById('idcard-checklist');
    checklistEl.innerHTML = '';
    main.forEach(function(t){
      var done = isUnlocked(t, unlocked);
      var span = document.createElement('span');
      span.className = done ? 'done' : '';
      span.innerHTML = (done ? CHECK_ICON_SVG : DOT_ICON_SVG) + '<span>' + t.tier + '</span>';
      checklistEl.appendChild(span);
    });

    var goalEl = document.getElementById('idcard-next-goal');
    if(bonusDone){
      goalEl.innerHTML = 'Rang <b>Geheimnisträger</b> erreicht — der seltenste Ausweis, den es gibt.';
    } else if(doneCount >= main.length){
      goalEl.innerHTML = 'Alle Tricks gemeistert — der <b>Geheimtrick</b> schaltet sich gleich frei!';
    } else {
      var remaining = main.length - doneCount;
      goalEl.innerHTML = 'Noch <b>' + remaining + '</b> Trick' + (remaining === 1 ? '' : 's') + ' bis zum <b>Geheimtrick</b>.';
    }
  }

  var idcardFlip = document.getElementById('idcard-flip');
  idcardFlip.addEventListener('click', function(){
    idcardFlip.classList.toggle('is-flipped');
  });
  idcardFlip.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
      e.preventDefault();
      idcardFlip.classList.toggle('is-flipped');
    }
  });

  var nickInput = document.getElementById('idcard-nick-input');
  var photoInput = document.getElementById('idcard-photo-input');
  var photoBtn = document.getElementById('idcard-photo-btn');
  var shuffleBtn = document.getElementById('idcard-shuffle');
  var exportBtn = document.getElementById('idcard-export');
  var saveHint = document.getElementById('idcard-save-hint');
  var exportPreview = document.getElementById('idcard-export-preview');

  nickInput.value = passport.nick || '';
  nickInput.addEventListener('input', function(){
    passport.nick = nickInput.value.slice(0, 18);
    savePassport(passport);
    renderIdCard();
  });

  photoBtn.addEventListener('click', function(){ photoInput.click(); });

  photoInput.addEventListener('change', function(){
    var file = photoInput.files && photoInput.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      var img = new Image();
      img.onload = function(){
        var size = 300;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        passport.photo = canvas.toDataURL('image/jpeg', 0.85);
        savePassport(passport);
        renderIdCard();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  shuffleBtn.addEventListener('click', function(){
    passport.epithet = randomEpithet(passport.epithet);
    savePassport(passport);
    renderIdCard();
  });

  exportBtn.addEventListener('click', async function(){
    if(!passport.nick){
      saveHint.style.color = 'var(--danger)';
      saveHint.textContent = 'Trag zuerst einen Spitznamen ein.';
      return;
    }
    if(typeof html2canvas === 'undefined'){
      saveHint.style.color = 'var(--danger)';
      saveHint.textContent = 'Bild-Erzeugung gerade nicht verfügbar — später nochmal versuchen.';
      return;
    }
    saveHint.style.color = '';
    saveHint.textContent = 'Ausweis wird erzeugt …';
    exportBtn.disabled = true;

    try{
      if(document.fonts && document.fonts.ready){ await document.fonts.ready; }
      idcardFlip.classList.remove('is-flipped');
      var cardEl = document.getElementById('idcard-front');
      var canvas = await html2canvas(cardEl, { backgroundColor: null, scale: 2 });
      var dataUrl = canvas.toDataURL('image/png');

      exportPreview.innerHTML = '';
      var exportImg = document.createElement('img');
      exportImg.alt = 'Dein Zauberausweis';
      exportImg.src = dataUrl;
      exportPreview.appendChild(exportImg);
      saveHint.innerHTML = 'Fertig! Zum Speichern: Bild <b>gedrückt halten</b> (Handy) oder <b>Rechtsklick → Bild speichern unter</b> (Desktop).';

      // progressive enhancement: offer a one-tap save where the platform supports it
      if(window.claude && window.claude.use){
        try{
          var downloads = await window.claude.use('downloads');
          if(downloads){
            canvas.toBlob(function(blob){
              if(!blob) return;
              var fname = 'zauberausweis-' + (passport.nick || 'gast').toLowerCase().replace(/[^a-z0-9]/g, '') + '.png';
              downloads.save({ filename: fname, data: blob }).catch(function(){ /* viewer declined — the image above still works */ });
            }, 'image/png');
          }
        }catch(e){}
      }
    } catch(e){
      saveHint.style.color = 'var(--danger)';
      saveHint.textContent = 'Bild-Erzeugung hat nicht geklappt — bitte nochmal versuchen.';
    } finally {
      exportBtn.disabled = false;
    }
  });

  function setupReveal(){
    var els = document.querySelectorAll('.reveal:not(.in-view)');
    if(!('IntersectionObserver' in window)){
      els.forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    els.forEach(function(el){ io.observe(el); });
  }

  /* ---------------- Scroll-Fortschritt + Parallax-Effekte ---------------- */
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var progressFillEl = document.getElementById('scroll-progress-fill');
  var heroEl = document.getElementById('hero');
  var coinEl = document.getElementById('coin');
  var coinBtn = document.getElementById('coin-btn');
  var legendFront = document.getElementById('legend-front');
  var legendBack = document.getElementById('legend-back');
  var scrollTicking = false;

  /* Muenzrand: ein paar duenne Scheiben hintereinander ergeben die Dicke */
  (function buildCoinEdge(){
    var edge = document.getElementById('coin-edge');
    if(!edge) return;
    var layers = 12;
    for(var i = 0; i < layers; i++){
      var layer = document.createElement('i');
      var f = i / (layers - 1) - 0.5;
      layer.style.transform = 'translateZ(calc(var(--t) * ' + f.toFixed(3) + '))';
      edge.appendChild(layer);
    }
  })();

  /* Drehung der Muenze: Scrollen dreht sie von der QR-Seite zur Code-Seite;
     Antippen dreht sie um; am Desktop kippt sie leicht mit der Maus. */
  var coinFlipOffset = 0;
  var coinTiltX = 0, coinTiltY = 0;
  var coinScrollAngle = 0;

  function applyCoin(){
    if(!coinEl) return;
    var ry = -20 + coinScrollAngle + coinFlipOffset + coinTiltY;
    var rx = 8 + coinTiltX;
    coinEl.style.setProperty('--ry', ry.toFixed(1) + 'deg');
    coinEl.style.setProperty('--rx', rx.toFixed(1) + 'deg');
    var norm = ((ry % 360) + 360) % 360;
    var showFront = norm < 90 || norm > 270;
    if(legendFront && legendBack){
      legendFront.classList.toggle('on', showFront);
      legendBack.classList.toggle('on', !showFront);
    }
  }

  function updateOnScroll(){
    scrollTicking = false;
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var scrollable = (doc.scrollHeight - doc.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
    if(progressFillEl){ progressFillEl.style.width = pct + '%'; }

    if(!prefersReducedMotion && heroEl){
      var range = Math.min(600, Math.max(240, heroEl.offsetHeight * 0.7));
      coinScrollAngle = Math.min(1, Math.max(0, scrollTop / range)) * 200;
      applyCoin();
    }
  }

  function onScroll(){
    if(!scrollTicking){
      scrollTicking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  updateOnScroll();
  applyCoin();

  if(coinBtn && coinEl){
    coinBtn.addEventListener('click', function(){
      coinEl.classList.add('is-flipping');
      coinFlipOffset = coinFlipOffset === 0 ? 180 : 0;
      applyCoin();
      setTimeout(function(){ coinEl.classList.remove('is-flipping'); }, 650);
    });
  }

  if(coinBtn && coinEl && !prefersReducedMotion && window.matchMedia && window.matchMedia('(pointer:fine)').matches){
    coinBtn.addEventListener('mousemove', function(ev){
      var rect = coinBtn.getBoundingClientRect();
      var nx = ((ev.clientX - rect.left) / rect.width) - 0.5;
      var ny = ((ev.clientY - rect.top) / rect.height) - 0.5;
      coinTiltY = nx * 16;
      coinTiltX = -ny * 12;
      applyCoin();
    });
    coinBtn.addEventListener('mouseleave', function(){
      coinTiltX = 0; coinTiltY = 0;
      applyCoin();
    });
  }

  render();
  setupReveal();
})();
