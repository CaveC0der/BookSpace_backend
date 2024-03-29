INSERT INTO users
    (username, email, password, "createdAt", "updatedAt")
VALUES
    ('First', 'first@mail.com', '$2b$08$ZC1.w.baYLtj9CJY6/3xA.IZOs11XLcbFnZxNH4IgnErYqHAQ/fiy', NOW(), NOW()),
    ('Second', 'second@mail.com', '$2b$08$7x1qq.TDjqeJ1obNXVZYQOqUuspbZCYioUqwbecSWKQNwcfMRUQ72', NOW(), NOW()),
    ('Third', 'third@mail.com', '$2b$08$Zkt5.wzypwWE.R8lt6g7gepJn6GzHGTaUEi0V8aoJKqYkFSvXwqJy', NOW(), NOW()),
    ('Fourth', 'fourth@mail.com', '$2b$08$yJJx9iFouerDbb0hXRUgaeeg/uTr2uzoygGPneLf2Xq2ow8IHzROq', NOW(), NOW()),
    ('Fifth', 'fifth@mail.com', '$2b$08$Qg1foRW23Z7GpJz0GpRLY.pNQ.94OMBr5nYW.enti0ppvfXFCJhfa', NOW(), NOW()),
    ('Sixth', 'sixth@mail.com', '$2b$08$J.NLZs98LJZE38ZZsddWb.VKKEymeZOUhnPOxoWbmiHv1zVbl3tmW', NOW(), NOW()),
    ('Seventh', 'seventh@mail.com', '$2b$08$omEWkClA3dWNt32Nq/3r2.bJ1V.vpSlE0sDzJGUAUofbf3peBQhJW', NOW(), NOW()),
    ('Eighth', 'eighth@mail.com', '$2b$08$1ROvoa4ZCvnCVdnV/BH9yOyghvvl4GcKQ/Q8aTLTdmTJJlipMedAm', NOW(), NOW()),
    ('Ninth', 'ninth@mail.com', '$2b$08$qtyZyFhWEeAK4hP8cMi4Qe2bj4m7cAyd2hvsS.qWhn2e1FVMQaHPG', NOW(), NOW());

INSERT INTO users_roles
VALUES
    (1, 'Admin'),
    (1, 'Author'),
    (2, 'Author'),
    (3, 'Author'),
    (4, 'Author'),
    (5, 'Author');

INSERT INTO genres
    (name, "createdAt")
VALUES
    ('Fantasy', NOW()),
    ('Romance', NOW()),
    ('Drama', NOW()),
    ('Mystery', NOW()),
    ('Thriller', NOW()),
    ('Comedy', NOW()),
    ('Action', NOW()),
    ('Adventure', NOW()),
    ('Historical', NOW()),
    ('Horror', NOW());

-- First Book
INSERT INTO books
    (name, "authorId", "createdAt", "updatedAt")
VALUES
    ('First', 1, NOW(), NOW()),
    ('Second', 1, NOW(), NOW()),
    ('Third', 1, NOW(), NOW()),
    ('Fourth', 1, NOW(), NOW()),
    ('Fifth', 1, NOW(), NOW()),
    ('Sixth', 1, NOW(), NOW()),
    ('Seventh', 1, NOW(), NOW()),
    ('Eighth', 1, NOW(), NOW()),
    ('Ninth', 1, NOW(), NOW()),
    ('Mirage', 2, NOW(), NOW()),
    ('Catalyst', 3, NOW(), NOW()),
    ('Labyrinth', 4, NOW(), NOW()),
    ('Pinnacle', 5, NOW(), NOW()),
    ('Eclipse', 6, NOW(), NOW()),
    ('Odyssey', 7, NOW(), NOW()),
    ('Spectrum', 8, NOW(), NOW()),
    ('Nexus', 9, NOW(), NOW()),
    ('Ephemeral', 2, NOW(), NOW()),
    ('Enigma', 3, NOW(), NOW()),
    ('Serenity', 4, NOW(), NOW()),
    ('Quasar', 5, NOW(), NOW()),
    ('Nebula', 6, NOW(), NOW()),
    ('Zenith', 7, NOW(), NOW()),
    ('Ethereal', 8, NOW(), NOW()),
    ('Vertex', 9, NOW(), NOW()),
    ('Apogee', 2, NOW(), NOW()),
    ('Zen', 3, NOW(), NOW()),
    ('Infinity', 4, NOW(), NOW()),
    ('Aurora', 5, NOW(), NOW());

INSERT INTO books_genres
    ("bookId", genre)
VALUES
    (1, 'Fantasy'),
    (1, 'Romance'),
    (1, 'Mystery'),
    (2, 'Drama'),
    (2, 'Mystery'),
    (3, 'Thriller'),
    (3, 'Comedy'),
    (4, 'Action'),
    (4, 'Adventure'),
    (5, 'Historical'),
    (5, 'Horror'),
    (6, 'Fantasy'),
    (7, 'Romance'),
    (7, 'Drama'),
    (8, 'Mystery'),
    (8, 'Thriller'),
    (9, 'Comedy'),
    (9, 'Action'),
    (10, 'Adventure'),
    (10, 'Historical'),
    (11, 'Horror'),
    (12, 'Fantasy'),
    (12, 'Romance'),
    (13, 'Drama'),
    (13, 'Mystery'),
    (14, 'Thriller'),
    (14, 'Comedy'),
    (15, 'Action'),
    (15, 'Adventure'),
    (16, 'Historical'),
    (16, 'Horror'),
    (17, 'Fantasy'),
    (18, 'Romance'),
    (18, 'Drama'),
    (19, 'Mystery'),
    (19, 'Thriller'),
    (20, 'Comedy'),
    (20, 'Action'),
    (21, 'Adventure'),
    (21, 'Historical'),
    (22, 'Horror'),
    (23, 'Fantasy'),
    (23, 'Romance'),
    (24, 'Drama'),
    (24, 'Mystery'),
    (25, 'Thriller'),
    (25, 'Comedy'),
    (26, 'Action'),
    (26, 'Adventure'),
    (27, 'Historical'),
    (27, 'Horror'),
    (28, 'Fantasy'),
    (29, 'Romance'),
    (29, 'Drama');

INSERT INTO reviews
    ("userId", "bookId", rate, text, "createdAt", "updatedAt")
VALUES
    (1, 2, FLOOR(random() * 5) + 1, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', NOW(), NOW()),
    (2, 5, FLOOR(random() * 5) + 1, 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', NOW(), NOW()),
    (3, 8, FLOOR(random() * 5) + 1, 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Quisque feugiat massa eu metus tincidunt, vel ultrices nulla condimentum.', NOW(), NOW()),
    (4, 11, FLOOR(random() * 5) + 1, 'Fusce a nulla nec lectus posuere facilisis vel nec purus.', NOW(), NOW()),
    (5, 14, FLOOR(random() * 5) + 1, 'Donec aliquet consectetur sem, in tristique odio ultrices vel.', NOW(), NOW()),
    (6, 17, FLOOR(random() * 5) + 1, 'Nullam ut mi at tellus aliquam eleifend.', NOW(), NOW()),
    (7, 20, FLOOR(random() * 5) + 1, 'Proin fermentum dolor ut libero euismod, vel posuere odio tempor.', NOW(), NOW()),
    (8, 23, FLOOR(random() * 5) + 1, 'Curabitur id urna eu velit commodo commodo.', NOW(), NOW()),
    (9, 26, FLOOR(random() * 5) + 1, 'Phasellus gravida, elit at commodo congue, odio mauris fringilla quam, ut scelerisque lectus urna in leo.', NOW(), NOW()),
    (1, 29, FLOOR(random() * 5) + 1, 'Maecenas vitae elit non odio cursus bibendum.', NOW(), NOW()),
    (2, 3, FLOOR(random() * 5) + 1, 'Vivamus id augue ut felis congue fermentum.', NOW(), NOW()),
    (3, 6, FLOOR(random() * 5) + 1, 'Curabitur vehicula est at est cursus, vel interdum justo tincidunt.', NOW(), NOW()),
    (4, 9, FLOOR(random() * 5) + 1, 'Sed ac mi et ante imperdiet malesuada sit amet nec velit.', NOW(), NOW()),
    (5, 12, FLOOR(random() * 5) + 1, 'Aliquam auctor enim id lacus tristique, id euismod justo rhoncus.', NOW(), NOW()),
    (6, 15, FLOOR(random() * 5) + 1, 'Quisque tristique sem nec velit vulputate, vitae fermentum dui malesuada.', NOW(), NOW()),
    (7, 18, FLOOR(random() * 5) + 1, 'Aenean euismod erat id neque bibendum, vel fringilla mauris ullamcorper.', NOW(), NOW()),
    (8, 21, FLOOR(random() * 5) + 1, 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', NOW(), NOW()),
    (9, 24, FLOOR(random() * 5) + 1, 'Vivamus auctor elit eget justo aliquam, sit amet euismod turpis consequat.', NOW(), NOW()),
    (1, 27, FLOOR(random() * 5) + 1, 'Integer accumsan urna eget justo sagittis, nec luctus tellus venenatis.', NOW(), NOW()),
    (2, 1, FLOOR(random() * 5) + 1, 'Curabitur finibus nunc eget orci blandit, vel euismod justo lacinia.', NOW(), NOW()),
    (3, 4, FLOOR(random() * 5) + 1, 'Cras dignissim sapien et massa fringilla tincidunt.', NOW(), NOW()),
    (4, 7, FLOOR(random() * 5) + 1, 'Vestibulum rhoncus dolor vel neque commodo volutpat.', NOW(), NOW()),
    (5, 10, FLOOR(random() * 5) + 1, 'In hac habitasse platea dictumst. Nunc vel eros vel tortor facilisis dapibus.', NOW(), NOW()),
    (6, 13, FLOOR(random() * 5) + 1, 'Nullam eu ligula vel orci finibus varius a non odio.', NOW(), NOW()),
    (7, 16, FLOOR(random() * 5) + 1, 'Nam tincidunt ex at justo malesuada, non auctor nisi volutpat.', NOW(), NOW()),
    (8, 19, FLOOR(random() * 5) + 1, 'Sed in felis nec ex congue sodales ac eu eros.', NOW(), NOW()),
    (9, 22, FLOOR(random() * 5) + 1, 'Morbi dignissim leo non dui auctor, a venenatis purus efficitur.', NOW(), NOW()),
    (1, 25, FLOOR(random() * 5) + 1, 'Curabitur convallis mauris a arcu imperdiet, vel consectetur tortor fringilla.', NOW(), NOW()),
    (2, 28, FLOOR(random() * 5) + 1, 'Suspendisse potenti. Praesent tincidunt velit nec metus mattis, eu aliquam turpis malesuada.', NOW(), NOW()),
    (3, 2, FLOOR(random() * 5) + 1, 'Sed auctor sapien nec nisi laoreet, id ullamcorper velit eleifend.', NOW(), NOW()),
    (4, 5, FLOOR(random() * 5) + 1, 'Aenean non dui nec elit feugiat tincidunt ut et odio.', NOW(), NOW()),
    (5, 8, FLOOR(random() * 5) + 1, 'Pellentesque sit amet urna eu justo pellentesque pharetra.', NOW(), NOW()),
    (6, 11, FLOOR(random() * 5) + 1, 'Suspendisse potenti. Mauris scelerisque lectus ut efficitur tristique.', NOW(), NOW()),
    (7, 14, FLOOR(random() * 5) + 1, 'Donec sagittis urna at augue blandit, in venenatis purus feugiat.', NOW(), NOW()),
    (8, 17, FLOOR(random() * 5) + 1, 'Vivamus auctor elit eget justo aliquam, sit amet euismod turpis consequat.', NOW(), NOW()),
    (9, 20, FLOOR(random() * 5) + 1, 'Phasellus gravida, elit at commodo congue, odio mauris fringilla quam, ut scelerisque lectus urna in leo.', NOW(), NOW()),
    (1, 23, FLOOR(random() * 5) + 1, 'Maecenas vitae elit non odio cursus bibendum.', NOW(), NOW()),
    (2, 26, FLOOR(random() * 5) + 1, 'Quisque tristique sem nec velit vulputate, vitae fermentum dui malesuada.', NOW(), NOW()),
    (3, 29, FLOOR(random() * 5) + 1, 'Nullam ut mi at tellus aliquam eleifend.', NOW(), NOW());

INSERT INTO comments
    (text, "userId", "bookId", "createdAt", "updatedAt")
VALUES
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 4, 17, NOW(), NOW()),
    ('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 7, 23, NOW(), NOW()),
    ('Integer vestibulum ipsum vel orci eleifend, vel efficitur tellus tristique.', 2, 14, NOW(), NOW()),
    ('Sed eget augue ac metus tincidunt convallis.', 5, 8, NOW(), NOW()),
    ('Vestibulum cursus velit nec neque rhoncus, id bibendum risus finibus.', 8, 21, NOW(), NOW()),
    ('Quisque at ligula et turpis fermentum volutpat.', 3, 12, NOW(), NOW()),
    ('Cras sit amet ex a libero tincidunt suscipit.', 6, 27, NOW(), NOW()),
    ('Fusce sed justo nec purus fermentum fermentum.', 1, 19, NOW(), NOW()),
    ('Nunc vitae tortor in nulla laoreet congue.', 9, 5, NOW(), NOW()),
    ('Curabitur volutpat felis ut mauris fermentum, vel tristique elit blandit.', 2, 11, NOW(), NOW()),
    ('Aliquam ac sem vel neque cursus finibus.', 4, 24, NOW(), NOW()),
    ('Vivamus sit amet dolor vel metus tincidunt tincidunt.', 7, 16, NOW(), NOW()),
    ('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 5, 28, NOW(), NOW()),
    ('Integer a leo vitae sem volutpat convallis.', 8, 13, NOW(), NOW()),
    ('Duis euismod erat ut tortor fringilla, vel cursus metus ultricies.', 1, 7, NOW(), NOW()),
    ('Vestibulum fermentum urna eget luctus congue.', 6, 25, NOW(), NOW()),
    ('Maecenas sed dui non tellus fringilla laoreet.', 3, 9, NOW(), NOW()),
    ('Suspendisse eu justo nec felis vulputate ultricies.', 9, 20, NOW(), NOW()),
    ('Nulla facilisi. Curabitur euismod justo ac elit ullamcorper, vitae aliquam velit convallis.', 4, 15, NOW(), NOW()),
    ('Morbi luctus arcu eget lorem blandit feugiat.', 2, 18, NOW(), NOW()),
    ('Fusce quis odio vel nulla vulputate tincidunt.', 7, 26, NOW(), NOW()),
    ('Vivamus bibendum nisi vel diam rhoncus, eu semper nisl egestas.', 5, 10, NOW(), NOW()),
    ('Cras ac odio id ex vestibulum hendrerit ut sit amet nulla.', 8, 22, NOW(), NOW()),
    ('Aliquam tincidunt dui eu tellus dapibus, vel fermentum tortor condimentum.', 1, 6, NOW(), NOW()),
    ('Phasellus non justo ac nisl bibendum facilisis.', 3, 29, NOW(), NOW()),
    ('Curabitur vulputate lectus eget sem gravida, vel pellentesque arcu cursus.', 6, 16, NOW(), NOW()),
    ('Pellentesque eget libero ac dolor malesuada vestibulum.', 9, 8, NOW(), NOW()),
    ('Vestibulum sit amet turpis ut nunc feugiat scelerisque.', 2, 23, NOW(), NOW()),
    ('Fusce ac tellus ut libero tincidunt tincidunt.', 7, 14, NOW(), NOW()),
    ('Integer vel risus nec dolor venenatis laoreet id id ex.', 4, 27, NOW(), NOW()),
    ('Duis id elit nec justo ultricies finibus vel vitae elit.', 5, 12, NOW(), NOW()),
    ('Nunc ac nunc vel odio vestibulum tristique.', 8, 19, NOW(), NOW()),
    ('Sed eu orci euismod, sollicitudin mauris nec, vestibulum odio.', 1, 24, NOW(), NOW()),
    ('Cras auctor elit eget neque pharetra congue.', 3, 11, NOW(), NOW()),
    ('Suspendisse at purus at velit gravida eleifend a sit amet ligula.', 6, 28, NOW(), NOW()),
    ('Curabitur congue eros eget leo euismod, in tempus elit dignissim.', 9, 7, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 2, 25, NOW(), NOW()),
    ('Pellentesque quis odio eget sapien cursus posuere.', 4, 9, NOW(), NOW()),
    ('Donec vel velit sit amet erat bibendum lacinia.', 5, 22, NOW(), NOW()),
    ('Integer vel velit ac purus scelerisque hendrerit in vel urna.', 7, 15, NOW(), NOW()),
    ('Nunc vel ligula in metus vulputate rhoncus.', 8, 20, NOW(), NOW()),
    ('Fusce a odio nec velit tincidunt blandit vel eu dui.', 1, 10, NOW(), NOW()),
    ('Vivamus eu orci sit amet ex bibendum gravida.', 3, 26, NOW(), NOW()),
    ('Phasellus commodo velit ut dui faucibus, at fringilla dolor bibendum.', 6, 13, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 9, 18, NOW(), NOW()),
    ('Maecenas a justo vel velit rhoncus ultricies.', 2, 29, NOW(), NOW()),
    ('Vestibulum id felis vel dui congue sagittis a eget mauris.', 5, 16, NOW(), NOW()),
    ('Proin vitae elit vitae lacus convallis vulputate at sit amet lectus.', 4, 23, NOW(), NOW()),
    ('Curabitur vulputate lectus eget sem gravida, vel pellentesque arcu cursus.', 7, 12, NOW(), NOW()),
    ('Quisque nec nunc at leo scelerisque euismod.', 8, 27, NOW(), NOW()),
    ('Nulla facilisi. Sed quis ligula ac dui mattis efficitur.', 1, 8, NOW(), NOW()),
    ('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 3, 21, NOW(), NOW()),
    ('Vivamus bibendum nisi vel diam rhoncus, eu semper nisl egestas.', 6, 17, NOW(), NOW()),
    ('Integer vestibulum ipsum vel orci eleifend, vel efficitur tellus tristique.', 9, 14, NOW(), NOW()),
    ('Sed eu orci euismod, sollicitudin mauris nec, vestibulum odio.', 2, 25, NOW(), NOW()),
    ('Cras auctor elit eget neque pharetra congue.', 5, 11, NOW(), NOW()),
    ('Fusce ac tellus ut libero tincidunt tincidunt.', 8, 28, NOW(), NOW()),
    ('Duis id elit nec justo ultricies finibus vel vitae elit.', 1, 7, NOW(), NOW()),
    ('Suspendisse at purus at velit gravida eleifend a sit amet ligula.', 4, 19, NOW(), NOW()),
    ('Curabitur congue eros eget leo euismod, in tempus elit dignissim.', 7, 9, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 3, 23, NOW(), NOW()),
    ('Pellentesque quis odio eget sapien cursus posuere.', 6, 16, NOW(), NOW()),
    ('Donec vel velit sit amet erat bibendum lacinia.', 9, 12, NOW(), NOW()),
    ('Integer vel velit ac purus scelerisque hendrerit in vel urna.', 2, 22, NOW(), NOW()),
    ('Nunc vel ligula in metus vulputate rhoncus.', 5, 15, NOW(), NOW()),
    ('Fusce a odio nec velit tincidunt blandit vel eu dui.', 8, 20, NOW(), NOW()),
    ('Vivamus eu orci sit amet ex bibendum gravida.', 1, 10, NOW(), NOW()),
    ('Phasellus commodo velit ut dui faucibus, at fringilla dolor bibendum.', 3, 26, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 6, 13, NOW(), NOW()),
    ('Maecenas a justo vel velit rhoncus ultricies.', 9, 18, NOW(), NOW()),
    ('Vestibulum id felis vel dui congue sagittis a eget mauris.', 2, 29, NOW(), NOW()),
    ('Proin vitae elit vitae lacus convallis vulputate at sit amet lectus.', 5, 16, NOW(), NOW()),
    ('Curabitur vulputate lectus eget sem gravida, vel pellentesque arcu cursus.', 7, 12, NOW(), NOW()),
    ('Quisque nec nunc at leo scelerisque euismod.', 8, 27, NOW(), NOW()),
    ('Nulla facilisi. Sed quis ligula ac dui mattis efficitur.', 1, 8, NOW(), NOW()),
    ('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 3, 21, NOW(), NOW()),
    ('Vivamus bibendum nisi vel diam rhoncus, eu semper nisl egestas.', 6, 17, NOW(), NOW()),
    ('Integer vestibulum ipsum vel orci eleifend, vel efficitur tellus tristique.', 9, 14, NOW(), NOW()),
    ('Sed eu orci euismod, sollicitudin mauris nec, vestibulum odio.', 2, 25, NOW(), NOW()),
    ('Cras auctor elit eget neque pharetra congue.', 5, 11, NOW(), NOW()),
    ('Fusce ac tellus ut libero tincidunt tincidunt.', 8, 28, NOW(), NOW()),
    ('Duis id elit nec justo ultricies finibus vel vitae elit.', 1, 7, NOW(), NOW()),
    ('Suspendisse at purus at velit gravida eleifend a sit amet ligula.', 4, 19, NOW(), NOW()),
    ('Curabitur congue eros eget leo euismod, in tempus elit dignissim.', 7, 9, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 3, 23, NOW(), NOW()),
    ('Pellentesque quis odio eget sapien cursus posuere.', 6, 16, NOW(), NOW()),
    ('Donec vel velit sit amet erat bibendum lacinia.', 9, 12, NOW(), NOW()),
    ('Integer vel velit ac purus scelerisque hendrerit in vel urna.', 2, 22, NOW(), NOW()),
    ('Nunc vel ligula in metus vulputate rhoncus.', 5, 15, NOW(), NOW()),
    ('Fusce a odio nec velit tincidunt blandit vel eu dui.', 8, 20, NOW(), NOW()),
    ('Vivamus eu orci sit amet ex bibendum gravida.', 1, 10, NOW(), NOW()),
    ('Phasellus commodo velit ut dui faucibus, at fringilla dolor bibendum.', 3, 26, NOW(), NOW()),
    ('Nam auctor justo vel libero tincidunt, in posuere elit iaculis.', 6, 13, NOW(), NOW()),
    ('Maecenas a justo vel velit rhoncus ultricies.', 9, 18, NOW(), NOW()),
    ('Vestibulum id felis vel dui congue sagittis a eget mauris.', 2, 29, NOW(), NOW()),
    ('Proin vitae elit vitae lacus convallis vulputate at sit amet lectus.', 5, 16, NOW(), NOW()),
    ('Curabitur vulputate lectus eget sem gravida, vel pellentesque arcu cursus.', 7, 12, NOW(), NOW()),
    ('Quisque nec nunc at leo scelerisque euismod.', 8, 27, NOW(), NOW()),
    ('Nulla facilisi. Sed quis ligula ac dui mattis efficitur.', 1, 8, NOW(), NOW()),
    ('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 3, 21, NOW(), NOW()),
    ('Vivamus bibendum nisi vel diam rhoncus, eu semper nisl egestas.', 6, 17, NOW(), NOW()),
    ('Integer vestibulum ipsum vel orci eleifend, vel efficitur tellus tristique.', 9, 14, NOW(), NOW()),
    ('Sed eu orci euismod, sollicitudin mauris nec, vestibulum odio.', 2, 25, NOW(), NOW()),
    ('Cras auctor elit eget neque pharetra congue.', 5, 11, NOW(), NOW()),
    ('Fusce ac tellus ut libero tincidunt tincidunt.', 8, 28, NOW(), NOW()),
    ('Duis id elit nec justo ultricies finibus vel vitae elit.', 1, 7, NOW(), NOW()),
    ('Suspendisse at purus at velit gravida eleifend a sit amet ligula.', 4, 19, NOW(), NOW());
