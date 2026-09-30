/* Curriculum + story for Wordhollow.

   Each region teaches ONE spelling pattern explicitly (pattern card on arrival),
   in the order used by systematic phonics scopes for grades 1 → 2:
     short vowels → digraphs → blends → silent e → vowel teams → r-controlled → endings.

   Word notation: sound boxes separated by "."  (one box per sound / grapheme)
     sh.i.p      "sh" is one sound, so one (wider) box
     c.a.k.+e    "+e" is a silent-e box (shown small, linked to the vowel)
     th.[e]      [ ] marks the "heart" part of an irregular word — learned by heart
     jump.ing    in the last region boxes are word parts (base + ending)
   The spelled word is the segments joined without the markers. */

window.REGIONS = [
  {
    id: 'meadow', name: 'Meadow Hollow', grade: 'Grade 1',
    pattern: 'Short a and short i',
    teach: 'In a short word with one vowel, the vowel is usually short.',
    points: [['a', 'says /a/ as in apple'], ['i', 'says /i/ as in itch']],
    examples: ['cat', 'pig', 'map'],
    rule: 'One vowel in the middle of a short word is usually short: a as in apple, i as in itch.',
    say: 'Short a says [[æ|a]], as in apple. Short i says [[ɪ|ih]], as in itch. Tap each sound, then spell it.',
    focus: 'vowel', scaffold: 'tray',
    ground: 'spring', trees: ['green', 'blossom', 'green'], decor: ['flowers', 'flowers', 'bush', 'rock', 'stump'],
    words: [
      ['c.a.t', 'The cat naps in the sun.'],
      ['m.a.p', 'We look at the map.'],
      ['p.i.g', 'The pig rolls in the mud.'],
      ['s.i.t', 'Come and sit by me.'],
      ['th.[e]', 'The sun is warm today.', 'heart'],
      ['b.a.g', 'Put the apple in the bag.'],
      ['l.i.d', 'Put the lid on the pot.'],
      ['h.a.t', 'Dad has a red hat.'],
      ['d.i.g', 'Dogs like to dig holes.'],
      ['i.[s]', 'It is time for lunch.', 'heart'],
      ['j.a.m', 'I like jam on my toast.'],
      ['w.i.n', 'I hope we win the game.'],
      ['v.a.n', 'The van is big and blue.'],
      ['f.i.n', 'The fish has a fin.'],
      ['r.a.n', 'The dog ran to the gate.'],
    ],
    spots: [
      { slot: 0, type: 'house', v: 'brown', npc: 'Grandma Wren', look: 'grandma', task: 'Warm up the bakery',
        ask: 'My oven went cold overnight. A few good words should warm it right up.',
        thanks: 'Smell that bread! Take a warm roll for the road.', gift: ['bread', 'Warm roll'] },
      { slot: 1, type: 'garden', v: 'tulips', npc: 'Bea', look: 'bea', task: 'Wake the tulip bed',
        ask: 'These tulips are sleeping in. Will you help me wake them?',
        thanks: 'Look at them stretch! Here, pick one.', gift: ['flower', 'Red tulip', '#d8463c'] },
      { slot: 2, type: 'pen', v: 'chickens', npc: 'Farmer Oli', look: 'farmer', task: 'Settle the hens',
        ask: 'My hens are in a flap. Spell with me and they will calm down.',
        thanks: 'Happy hens lay good eggs. This one is for you.', gift: ['egg', 'Brown egg'] },
      { slot: 3, type: 'house', v: 'teal', npc: 'Pip', look: 'pip', task: "Light Pip's windows",
        ask: 'Our lamps will not light. Can you spell a little brightness in?',
        thanks: 'So cozy now! You can have my spare ribbon.', gift: ['ribbon', 'Blue ribbon'] },
      { slot: 4, type: 'well', v: 'stone', npc: 'Old Moss', look: 'elder', task: 'Fill the old well',
        ask: 'The well has gone dry. Around here, words are what fill it.',
        thanks: 'Fresh and cold again. Take a cup with you.', gift: ['cup', 'Cup of well water', '#6fb3d6'] },
    ],
  },
  {
    id: 'pond', name: 'Willow Pond', grade: 'Grade 1',
    pattern: 'Short o, u and e',
    teach: 'The other short vowels. Listen for the sound in the middle.',
    points: [['o', 'says /o/ as in octopus'], ['u', 'says /u/ as in up'], ['e', 'says /e/ as in egg']],
    examples: ['dog', 'sun', 'bed'],
    rule: 'Listen for the middle sound: o as in octopus, u as in up, e as in egg.',
    say: 'Short o says [[ɑ|ah]], as in octopus. Short u says [[ʌ|uh]], as in up. Short e says [[ɛ|eh]], as in egg.',
    focus: 'vowel', scaffold: 'tray',
    ground: 'lush', trees: ['green', 'willow', 'green'], decor: ['flowers', 'reeds', 'bush', 'rock', 'mushroom'],
    words: [
      ['d.o.g', 'The dog wags its tail.'],
      ['s.u.n', 'The sun is up.'],
      ['b.e.d', 'I read in bed.'],
      ['p.o.t', 'Soup is in the pot.'],
      ['t.[o]', 'We walk to the pond.', 'heart'],
      ['b.u.g', 'A bug is on the leaf.'],
      ['h.e.n', 'The hen sits on her eggs.'],
      ['l.o.g', 'A frog sat on a log.'],
      ['c.u.p', 'Fill the cup with milk.'],
      ['[o].[f]', 'I ate a bowl of soup.', 'heart'],
      ['w.e.b', 'The spider made a web.'],
      ['f.o.x', 'The fox ran into the woods.'],
      ['m.u.d', 'My boots are in the mud.'],
      ['n.e.t', 'She caught a fish in her net.'],
      ['h.u.g', 'Give me a big hug.'],
      ['r.e.d', 'The apple is red.'],
    ],
    spots: [
      { slot: 0, type: 'house', v: 'red', npc: 'Juniper', look: 'juniper', task: 'Sweep out the cobwebs',
        ask: 'Cobwebs everywhere! Help me sweep them out with some spelling?',
        thanks: 'Spotless! Please take a jar of honey.', gift: ['jar', 'Pond honey', '#e7a526'] },
      { slot: 1, type: 'garden', v: 'cabbages', npc: 'Rowan', look: 'rowan', task: 'Grow the cabbage patch',
        ask: 'Not one cabbage has come up. Maybe they need to hear some words.',
        thanks: 'Big as my head! Take the first leaf.', gift: ['leaf', 'Cabbage leaf'] },
      { slot: 2, type: 'pen', v: 'ducks', npc: 'Nell', look: 'nell', task: 'Fill the duck pond',
        ask: 'The ducks have no water to paddle in. Can you help?',
        thanks: 'Splashing again! One of them left you a feather.', gift: ['feather', 'Duck feather'] },
      { slot: 3, type: 'stall', v: 'bread', npc: 'Baker Tam', look: 'baker', task: 'Stock the bread cart',
        ask: 'Market day, and my cart is bare. Spell me some loaves?',
        thanks: 'Full to the top. Have a berry pie.', gift: ['pie', 'Berry pie'] },
      { slot: 4, type: 'fountain', v: 'stone', npc: 'Old Hollis', look: 'elder2', task: 'Wake the fountain',
        ask: 'This fountain has been quiet for years. Let us wake it up.',
        thanks: 'Listen to it sing! Here is a coin to toss in.', gift: ['coin', 'Wishing coin'] },
    ],
  },
  {
    id: 'orchard', name: 'Orchard Rise', grade: 'Grade 1',
    pattern: 'Two letters, one sound',
    teach: 'Some pairs of letters work together to make one sound.',
    points: [['sh', 'as in ship'], ['ch', 'as in chin'], ['th', 'as in bath'], ['wh', 'as in when'], ['ck', 'at the end, as in duck']],
    examples: ['ship', 'chin', 'duck'],
    rule: 'Two letters, one sound: sh, ch, th, wh. After a short vowel, /k/ at the end is ck.',
    say: 'Some letter pairs make one sound. S H says [[ʃ|sh]]. C H says [[tʃ|ch]]. T H says [[θ|th]]. And after a short vowel, the [[k|k]] sound at the end is spelled C K.',
    focus: 'digraph', scaffold: 'boxes',
    ground: 'orchard', trees: ['apple', 'green', 'apple'], decor: ['flowers', 'bush', 'crate', 'rock', 'stump'],
    words: [
      ['sh.i.p', 'The ship sails on the sea.'],
      ['ch.i.n', 'He has jam on his chin.'],
      ['d.u.ck', 'The duck swims in the pond.'],
      ['f.i.sh', 'A fish swims fast.'],
      ['b.a.th', 'The dog needs a bath.'],
      ['w.[a].s', 'It was a sunny day.', 'heart'],
      ['wh.e.n', 'When can we go out?'],
      ['s.o.ck', 'I lost my red sock.'],
      ['ch.i.p', 'My cup has a chip in it.'],
      ['sh.o.p', 'We went to the shop.'],
      ['m.u.ch', 'Thank you very much.'],
      ['w.i.th', 'Come with me.'],
      ['b.a.ck', 'I will be right back.'],
      ['wh.i.p', 'Whip the cream until it is fluffy.'],
      ['m.a.th', 'We do math at school.'],
      ['n.e.ck', 'The giraffe has a long neck.'],
    ],
    spots: [
      { slot: 0, type: 'house', v: 'moss', npc: 'Clover', look: 'clover', task: 'Open the shutters',
        ask: 'My shutters are stuck shut. It is so gloomy in here.',
        thanks: 'Sunshine at last! I knitted you a scarf.', gift: ['scarf', 'Green scarf', '#4f9a52'] },
      { slot: 1, type: 'appletree', v: 'apple', npc: 'Ash', look: 'ash', task: 'Ripen the apples',
        ask: 'The apples are still green and hard. Help them along?',
        thanks: 'Red and crisp! Pick the best one.', gift: ['apple', 'Crisp apple', '#d23a2e'] },
      { slot: 2, type: 'pen', v: 'goats', npc: 'Greta', look: 'greta', task: 'Cheer up the goats',
        ask: 'My goats are grumpy today. Nothing makes them smile.',
        thanks: 'Hopping about again! Take some fresh milk.', gift: ['jar', 'Goat milk', '#f3efe4'] },
      { slot: 3, type: 'stall', v: 'fruit', npc: 'Chet', look: 'chet', task: 'Fill the fruit stand',
        ask: 'I have baskets but no fruit to put in them.',
        thanks: 'What a stand! Cherries for you.', gift: ['apple', 'Cherries', '#a8233a'] },
      { slot: 4, type: 'well', v: 'stone', npc: 'Whit', look: 'whit', task: 'Fix the well crank',
        ask: 'The crank is stuck. Words make good oil around here.',
        thanks: 'Turns like new. I found this old key in the bucket.', gift: ['key', 'Old brass key'] },
    ],
  },
  {
    id: 'fields', name: 'Windmill Fields', grade: 'Grade 1',
    pattern: 'Blends',
    teach: 'In a blend, you hear every letter. Say each sound, slowly.',
    points: [['fr, fl, cr, dr', 'blends at the start'], ['st, sp, sl, pl', 'more starting blends'], ['nd, mp, st, nt', 'blends at the end']],
    examples: ['frog', 'stop', 'hand'],
    rule: 'In a blend you can hear every letter. Stretch the word out and write each sound you hear.',
    say: 'In a blend, you hear every sound. Frog: [[f|f]], [[ɹ|r]], [[ɑ|ah]], [[ɡ|g]]. Stretch the word out slowly.',
    focus: 'blend', scaffold: 'boxes',
    ground: 'golden', trees: ['green', 'orange', 'green'], decor: ['wheat', 'wheat', 'flowers', 'hay', 'rock'],
    words: [
      ['f.r.o.g', 'The frog hops into the pond.'],
      ['s.t.o.p', 'Stop at the red light.'],
      ['h.a.n.d', 'Hold my hand.'],
      ['f.l.a.g', 'The flag waves in the wind.'],
      ['s.[ai].d', 'Mom said we can go.', 'heart'],
      ['j.u.m.p', 'Can you jump over the log?'],
      ['c.r.a.b', 'A crab walks sideways.'],
      ['n.e.s.t', 'The bird sits on her nest.'],
      ['d.r.u.m', 'He plays the drum.'],
      ['m.i.l.k', 'I drink milk at lunch.'],
      ['y.[ou]', 'Can you help me?', 'heart'],
      ['s.p.i.n', 'Watch the top spin.'],
      ['l.a.m.p', 'Turn on the lamp.'],
      ['p.l.u.m', 'The plum is sweet.'],
      ['t.e.n.t', 'We slept in a tent.'],
      ['s.l.e.d', 'We ride the sled down the hill.'],
    ],
    spots: [
      { slot: 0, type: 'windmill', v: 'mill', npc: 'Miller Fran', look: 'fran', task: 'Spin the windmill',
        ask: 'The sails have stopped, so no flour today. Can you get them turning?',
        thanks: 'Round and round! Take a sack of flour.', gift: ['sack', 'Sack of flour'] },
      { slot: 1, type: 'house', v: 'thatch', npc: 'Brody', look: 'brody', task: 'Plant the window boxes',
        ask: 'My window boxes are empty. They look so sad.',
        thanks: 'Much better. Try my plum jam!', gift: ['jar', 'Plum jam', '#7b3a78'] },
      { slot: 2, type: 'garden', v: 'sunflowers', npc: 'Sunny', look: 'sunny', task: 'Raise the sunflowers',
        ask: 'My sunflowers are tiny. Help them grow tall?',
        thanks: 'Taller than me! Here is one for you.', gift: ['flower', 'Sunflower', '#f2c12e'] },
      { slot: 3, type: 'pen', v: 'sheep', npc: 'Flint', look: 'flint', task: 'Round up the sheep',
        ask: 'The sheep are all mixed up. Help me settle them?',
        thanks: 'All calm. Have some of their wool.', gift: ['wool', 'Soft wool'] },
      { slot: 4, type: 'fountain', v: 'stone', npc: 'Stella', look: 'stella', task: 'Clear the fountain',
        ask: 'Leaves have clogged the fountain. Let us clear it.',
        thanks: 'Clear as glass. Take a wishing stone.', gift: ['coin', 'Wishing stone', '#9fb4c7'] },
    ],
  },
  {
    id: 'glen', name: 'Pumpkin Glen', grade: 'Grade 1 → 2',
    pattern: 'Silent e',
    teach: 'A silent e at the end makes the vowel say its name.',
    points: [['a_e', 'cap → cape'], ['i_e', 'kit → kite'], ['o_e', 'hop → hope'], ['u_e', 'cub → cube']],
    examples: ['cake', 'kite', 'bone'],
    rule: 'Silent e jumps over one letter and makes the vowel say its name: kit → kite.',
    say: 'Silent e makes the vowel say its name. Kit becomes kite. Hop becomes hope. You cannot hear the e, but you have to write it.',
    focus: 'silente', scaffold: 'boxes',
    ground: 'autumn', trees: ['magenta', 'orange', 'bare', 'orange'], decor: ['pumpkin', 'leaves', 'flowers', 'crate', 'stump'],
    words: [
      ['c.a.k.+e', 'We had cake for my birthday.'],
      ['k.i.t.+e', 'My kite flew over the trees.'],
      ['b.o.n.+e', 'The dog hid a bone.'],
      ['g.a.t.+e', 'Close the gate, please.'],
      ['t.i.m.+e', 'It is time for bed.'],
      ['c.[o].m.[e]', 'Come to my house.', 'heart'],
      ['h.o.m.+e', 'Let us go home.'],
      ['c.u.t.+e', 'The puppy is so cute.'],
      ['n.a.m.+e', 'What is your name?'],
      ['f.i.v.+e', 'I am five years old.'],
      ['r.o.p.+e', 'Hold on to the rope.'],
      ['s.[o].m.[e]', 'Can I have some?', 'heart'],
      ['l.a.k.+e', 'We swam in the lake.'],
      ['b.i.k.+e', 'I ride my bike to school.'],
      ['t.u.b.+e', 'Squeeze the tube of paint.'],
      ['n.o.s.+e', 'I smell with my nose.'],
    ],
    spots: [
      { slot: 0, type: 'house', v: 'brown', npc: 'Hazel', look: 'witch', task: 'Light the lamps',
        ask: 'The nights are getting long, and my lamps will not light.',
        thanks: 'Such a warm glow. Take a candle home.', gift: ['candle', 'Honey candle'] },
      { slot: 1, type: 'house', v: 'red', npc: 'Rufus', look: 'rufus', task: 'Fix the chimney',
        ask: 'My chimney is blocked and my house is so cold.',
        thanks: 'Toasty! I knitted this scarf by the fire.', gift: ['scarf', 'Orange scarf', '#e07b2c'] },
      { slot: 2, type: 'garden', v: 'pumpkins', npc: 'Poppy', look: 'poppy', task: 'Grow the pumpkin patch',
        ask: 'The harvest fair is soon, and my pumpkins are still tiny.',
        thanks: 'Enormous! Take the round one.', gift: ['pumpkin', 'Little pumpkin'] },
      { slot: 3, type: 'pen', v: 'pigs', npc: 'Bramble', look: 'bramble', task: 'Feed the pigs',
        ask: 'The pigs are hungry, and the trough is empty.',
        thanks: 'Happy snorts all round. Have a slice of pie.', gift: ['pie', 'Pumpkin pie', '#e08a2c'] },
      { slot: 4, type: 'well', v: 'stone', npc: 'Sage', look: 'sage', task: 'Clean the old well',
        ask: 'Leaves have filled the well. Spell with me and we will clean it.',
        thanks: 'Sparkling. You should keep the lucky penny I found.', gift: ['coin', 'Lucky penny', '#c7753a'] },
    ],
  },
  {
    id: 'harbor', name: 'Saltwind Harbor', grade: 'Grade 2',
    pattern: 'Vowel teams',
    teach: 'Two vowels together often say one long sound. When two vowels go walking, the first one does the talking.',
    points: [['ai / ay', 'long a: ai in the middle, ay at the end'], ['ee / ea', 'long e: tree, leaf'], ['oa / ow', 'long o: boat, snow']],
    examples: ['rain', 'play', 'boat'],
    rule: 'Long a: ai in the middle (rain), ay at the end (play). Long e: ee or ea. Long o: oa in the middle, ow at the end.',
    say: 'Vowel teams are two letters that make one long sound. Rain and play both say [[eɪ|ay]]: A I goes in the middle, A Y goes at the end.',
    focus: 'team', scaffold: 'letters',
    ground: 'sand', trees: ['palm', 'green', 'palm'], decor: ['shell', 'grass', 'crate', 'barrel', 'rock'],
    sea: true,
    words: [
      ['r.ai.n', 'The rain taps on the roof.'],
      ['p.l.ay', 'Can we play outside?'],
      ['b.oa.t', 'The boat floats on the sea.'],
      ['t.r.ee', 'A bird sits in the tree.'],
      ['l.ea.f', 'A leaf fell from the tree.'],
      ['th.[ey]', 'They waved from the dock.', 'heart'],
      ['s.n.ow', 'The snow is cold and white.'],
      ['p.ai.n.t', 'We paint the fence blue.'],
      ['s.t.ay', 'Please stay for dinner.'],
      ['f.ee.t', 'My feet are wet from the waves.'],
      ['c.oa.t', 'Put on your coat.'],
      ['t.ea.m', 'Our team won the game.'],
      ['t.ai.l', 'The cat has a long tail.'],
      ['g.r.ow', 'Seeds grow into plants.'],
      ['s.ee.d', 'Plant the seed in the dirt.'],
      ['r.oa.d', 'The road goes to the sea.'],
    ],
    spots: [
      { slot: 3, type: 'lighthouse', v: 'red', npc: 'Keeper Isla', look: 'isla', task: 'Light the lighthouse',
        ask: 'Boats are coming home, and my light has gone out!',
        thanks: 'They will find their way now. Take this sea glass.', gift: ['shell', 'Sea glass', '#7ccfc0'] },
      { slot: 0, type: 'house', v: 'teal', npc: 'Marlo', look: 'marlo', task: 'Mend the net house',
        ask: 'Salt wind has made my house so gray and gloomy.',
        thanks: 'Fresh as a sea breeze! Take a fish for supper.', gift: ['fish', 'Silver fish'] },
      { slot: 1, type: 'stall', v: 'fish', npc: 'Dory', look: 'dory', task: 'Open the fish stall',
        ask: 'My stall is empty and the market opens soon.',
        thanks: 'Busiest stall on the dock! Have a salt biscuit.', gift: ['cookie', 'Salt biscuit'] },
      { slot: 2, type: 'garden', v: 'roses', npc: 'Coral', look: 'coral', task: 'Grow the sea roses',
        ask: 'Sea roses grow in the sand, but mine will not bloom.',
        thanks: 'Pink as a sunrise! One is for you.', gift: ['flower', 'Sea rose', '#ec7fa6'] },
      { slot: 4, type: 'fountain', v: 'stone', npc: 'Captain Bo', look: 'captain', task: 'Wake the harbor fountain',
        ask: 'A harbor needs a fountain. Ours has been dry since the storm.',
        thanks: 'Ha! Splendid. A gold coin, for luck at sea.', gift: ['coin', 'Gold coin'] },
    ],
  },
  {
    id: 'frost', name: 'Frostfen', grade: 'Grade 2',
    pattern: 'Bossy r',
    teach: 'When r comes after a vowel, it changes the vowel sound.',
    points: [['ar', 'as in car'], ['or', 'as in corn'], ['er / ir / ur', 'all say /er/: her, bird, fur']],
    examples: ['star', 'corn', 'bird'],
    rule: 'Bossy r changes the vowel: ar (car), or (corn). er, ir and ur all say /er/, so you have to remember which one.',
    say: 'When r follows a vowel, it is bossy and changes the sound. A R says [[ɑɹ|ar]]. O R says [[ɔɹ|or]]. E R, I R and U R all say [[ɝ|er]].',
    focus: 'team', scaffold: 'letters',
    ground: 'snow', trees: ['pine', 'pine', 'bare'], decor: ['snowrock', 'drift', 'stump', 'pine_small', 'rock'],
    words: [
      ['c.ar', 'We ride in the car.'],
      ['c.or.n', 'We ate corn for dinner.'],
      ['b.ir.d', 'The bird sings at dawn.'],
      ['s.t.ar', 'I see a bright star.'],
      ['h.er', 'I gave her a hat.'],
      ['w.[ere]', 'We were so cold.', 'heart'],
      ['f.or.k', 'Eat with a fork.'],
      ['t.ur.n', 'It is your turn.'],
      ['f.ar.m', 'Cows live on the farm.'],
      ['g.ir.l', 'The girl ran up the hill.'],
      ['h.or.n', 'The goat has a horn.'],
      ['f.ur', 'The fox has thick fur.'],
      ['sh.ar.k', 'The shark swims in the sea.'],
      ['s.t.or.m', 'The storm blew all night.'],
      ['f.er.n', 'A fern grows in the shade.'],
      ['sh.ir.t', 'He has a blue shirt.'],
    ],
    spots: [
      { slot: 0, type: 'house', v: 'teal', npc: 'Birch', look: 'birch', task: 'Warm up the lodge',
        ask: 'Frost on the inside of the windows! Help me warm up?',
        thanks: 'Warm as toast. Take my spare mittens.', gift: ['mitten', 'Red mittens'] },
      { slot: 1, type: 'snowman', v: 'snow', npc: 'Tori', look: 'tori', task: 'Build a snowman',
        ask: 'I want a snowman, but the snow will not stick!',
        thanks: 'He is perfect! Have a snowflake charm.', gift: ['star', 'Snowflake charm', '#bfe3ff'] },
      { slot: 2, type: 'pen', v: 'sheep', npc: 'Old Fern', look: 'grandma2', task: 'Warm the woolly sheep',
        ask: 'My sheep are shivering. They need some cheer.',
        thanks: 'Cozy and fluffy. Take a ball of wool.', gift: ['wool', 'Winter wool'] },
      { slot: 3, type: 'garden', v: 'berries', npc: 'Juno', look: 'juno', task: 'Grow winter berries',
        ask: 'Winter berries grow in the snow, if you know the words.',
        thanks: 'Bright red! Take a handful.', gift: ['apple', 'Winter berries', '#c2273b'] },
      { slot: 4, type: 'well', v: 'stone', npc: 'Norris', look: 'norris', task: 'Thaw the frozen well',
        ask: 'The well is frozen solid. Let us thaw it out.',
        thanks: 'Water again! Have a hot cocoa.', gift: ['cup', 'Hot cocoa', '#7a4a2e'] },
    ],
  },
  {
    id: 'lantern', name: 'Lantern Heights', grade: 'Grade 2',
    pattern: 'Word parts',
    teach: 'Big words are built from smaller parts. Spell the base word, then add the ending.',
    points: [['-ing', 'jump → jumping'], ['-ed', 'jumped, played, painted'], ['-es', 'box → boxes'], ['compound', 'sun + set = sunset']],
    examples: ['jumping', 'played', 'sunset'],
    rule: 'Spell the base word first, then add the ending. -ed can sound like /t/, /d/ or /id/, but it is always spelled e d.',
    say: 'Long words are made of parts. Jumping is jump, plus ing. Sunset is sun, plus set. And the ending E D can sound three ways, but it is always spelled E D.',
    focus: 'parts', scaffold: 'open',
    ground: 'dusk', trees: ['dusk', 'dusk', 'blossom'], decor: ['glowflower', 'flowers', 'rock', 'lamp', 'mushroom'],
    words: [
      ['jump.ing', 'We are jumping in the leaves.', '', 'jump'],
      ['sun.set', 'The sunset was pink and gold.'],
      ['play.ed', 'We played until dark.', '', 'play'],
      ['box.es', 'We packed the boxes.', '', 'box'],
      ['be.c[au].[se]', 'I smiled because I was happy.', 'heart'],
      ['rain.ed', 'It rained all night.', '', 'rain'],
      ['cup.cake', 'I ate a cupcake.'],
      ['read.ing', 'I like reading at bedtime.', '', 'read'],
      ['wish.es', 'She has three wishes.', '', 'wish'],
      ['paint.ed', 'We painted the fence.', '', 'paint'],
      ['a.g[ai]n', 'Can we do it again?', 'heart'],
      ['rain.bow', 'A rainbow is in the sky.'],
      ['fish.ing', 'We went fishing on the lake.', '', 'fish'],
      ['snow.man', 'We built a snowman.'],
      ['help.ed', 'She helped me carry the bag.', '', 'help'],
      ['bed.time', 'It is almost bedtime.'],
    ],
    spots: [
      { slot: 1, type: 'lanterns', v: 'paper', npc: 'Lumi', look: 'lumi', task: 'Light the lantern path',
        ask: 'Tonight is the lantern festival, and not one lantern is lit.',
        thanks: 'Glowing all the way up the hill! Keep this one.', gift: ['lantern', 'Paper lantern'] },
      { slot: 0, type: 'house', v: 'plum', npc: 'Orla', look: 'orla', task: 'Open the storybook house',
        ask: 'This is the story house, but the stories have gone quiet.',
        thanks: 'I can hear them again! Take a storybook.', gift: ['book', 'Storybook'] },
      { slot: 2, type: 'garden', v: 'moonflowers', npc: 'Silas', look: 'silas', task: 'Bloom the moonflowers',
        ask: 'Moonflowers only open for well-spelled words.',
        thanks: 'Look how they shine. Take one to light your way.', gift: ['flower', 'Moonflower', '#dfe8ff'] },
      { slot: 3, type: 'stall', v: 'cookies', npc: 'Pim', look: 'pim', task: 'Bake festival cookies',
        ask: 'Everyone wants star cookies, but my oven is cold.',
        thanks: 'Still warm! Have the biggest one.', gift: ['cookie', 'Star cookie'] },
      { slot: 4, type: 'fountain', v: 'star', npc: 'Mayor Elm', look: 'mayor', task: 'Wake the star fountain',
        ask: 'You have helped every corner of Wordhollow. One last fountain waits.',
        thanks: 'Wordhollow is whole again, thanks to you. This golden star is yours.', gift: ['star', 'Golden star', '#f5c542'] },
    ],
  },
];

/* ---- parse word notation ---- */
window.parseWord = function (spec) {
  const segs = [];
  for (const raw of spec.split('.')) {
    let s = raw, silent = false;
    if (s.startsWith('+')) { silent = true; s = s.slice(1); }
    // a segment can hold heart parts inside it, e.g. "c[au]" → text "cau", heart letters 1-2
    let text = '', heart = [];
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '[') { const j = s.indexOf(']', i); for (const ch of s.slice(i + 1, j)) { heart.push(text.length); text += ch; } i = j; }
      else text += s[i];
    }
    segs.push({ text, silent, heart });
  }
  return { word: segs.map(s => s.text).join(''), segs };
};

/* ---- flat word table ---- */
window.WORDS = {};
REGIONS.forEach((r, ri) => {
  r.index = ri;
  r.list = r.words.map(([spec, sentence, kind, base]) => {
    const p = parseWord(spec);
    const w = { word: p.word, segs: p.segs, sentence, heart: kind === 'heart', base, region: ri };
    WORDS[w.word] = w;
    return w.word;
  });
  r.spots.forEach((s, si) => { s.id = r.id + '_' + si; s.region = ri; });
});

/* which boxes carry the pattern being taught (for highlighting) */
window.focusSegs = function (w) {
  const r = REGIONS[w.region], segs = w.segs, out = [];
  const vowel = t => /^[aeiou]$/.test(t);
  segs.forEach((s, i) => {
    if (s.heart.length) return;
    if (r.focus === 'vowel' && vowel(s.text)) out.push(i);
    if (r.focus === 'digraph' && s.text.length === 2) out.push(i);
    if (r.focus === 'team' && s.text.length >= 2 && !['sh', 'th', 'ch', 'wh', 'ck'].includes(s.text)) out.push(i);
    if (r.focus === 'silente' && (s.silent || (vowel(s.text) && segs.some(x => x.silent)))) out.push(i);
    if (r.focus === 'parts' && i > 0 && w.base) out.push(i);
  });
  if (r.focus === 'blend') {
    const cons = segs.map(s => !vowel(s.text));
    if (cons[0] && cons[1]) out.push(0, 1);
    const n = segs.length;
    if (cons[n - 1] && cons[n - 2]) out.push(n - 2, n - 1);
  }
  return out;
};

/* ---- every spoken line, for tools/make-audio.swift and the TTS fallback ----
   [[ipa|text]] voices the IPA with Apple voices; the browser voice reads "text". */
window.UI_LINES = {
  ui_heart: 'This is a heart word. Part of it does not follow the rules, so we learn that part by heart. Look closely.',
  ui_study: 'Here is how it is spelled. Look closely, and say each sound as you point.',
  ui_cover: 'Now it is hidden. Can you spell it from memory?',
  ui_again: 'Almost. Listen again, and fix the sounds that are marked.',
  ui_welcome: 'Welcome to Wordhollow. Here, well spelled words bring things to life. Walk up to anyone who needs help.',
  ui_unlock: 'A new path is open!',
};
window.CLIPS = {};
(function () {
  const add = (id, text) => { CLIPS[id] = { lang: 'en', text }; };
  for (const [id, t] of Object.entries(UI_LINES)) add(id, t);
  for (const w of Object.values(WORDS)) {
    add('w_' + w.word, w.word);
    add('s_' + w.word, w.sentence);
  }
  REGIONS.forEach(r => {
    add('r_' + r.id, r.name + '. ' + r.say);
    r.spots.forEach(s => { add('a_' + s.id, s.ask); add('t_' + s.id, s.thanks); });
  });
})();
window.clipPlain = t => t.replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1');
