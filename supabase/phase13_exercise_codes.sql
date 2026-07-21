-- Fase 13: codigo estable por ejercicio (ej. FB0001), tomado TAL CUAL de la
-- planilla de edicion del catalogo (Catalogo_ejercicios_Apex_v1.xlsx) que ya
-- tiene los 194 codigos asignados por categoria (AB/CD/PE/SP/FL/FB + 4
-- digitos correlativos). Matchea por el nombre ACTUAL del ejercicio en la
-- base (previo a cualquier correccion de nombre).
--
-- Correr en el SQL Editor de Supabase.

alter table exercises add column if not exists code text;

update exercises set code = 'AB0001' where name = '1 min activo / 1 min descanso' and code is distinct from 'AB0001';
update exercises set code = 'AB0002' where name = '1 min activo / 2 min descanso' and code is distinct from 'AB0002';
update exercises set code = 'AB0003' where name = '10 min activo / 10 min descanso' and code is distinct from 'AB0003';
update exercises set code = 'AB0004' where name = '5 min activo / 3 min descanso' and code is distinct from 'AB0004';
update exercises set code = 'AB0005' where name = '50:50 - De fácil a moderado' and code is distinct from 'AB0005';
update exercises set code = 'AB0006' where name = '50:50 - De moderado a fácil' and code is distinct from 'AB0006';
update exercises set code = 'AB0007' where name = '8 min activo / 5 min descanso' and code is distinct from 'AB0007';
update exercises set code = 'AB0008' where name = 'ARC Corto' and code is distinct from 'AB0008';
update exercises set code = 'AB0009' where name = 'ARC Largo' and code is distinct from 'AB0009';
update exercises set code = 'AB0010' where name = 'ARC Medio' and code is distinct from 'AB0010';
update exercises set code = 'AB0011' where name = 'Kilometraje de Boulder AC' and code is distinct from 'AB0011';
update exercises set code = 'CD0001' where name = 'Acondicionamiento de Core en Piso 1' and code is distinct from 'CD0001';
update exercises set code = 'CD0002' where name = 'Acondicionamiento de Core en Piso 2' and code is distinct from 'CD0002';
update exercises set code = 'CD0003' where name = 'Activación a Dos Brazos - Levantamiento - Fuerza' and code is distinct from 'CD0003';
update exercises set code = 'CD0004' where name = 'Activación a Un Brazo - ISO - 10 s' and code is distinct from 'CD0004';
update exercises set code = 'CD0005' where name = 'Activación a Un Brazo - Levantamientos - Fuerza' and code is distinct from 'CD0005';
update exercises set code = 'CD0006' where name = 'Activaciones' and code is distinct from 'CD0006';
update exercises set code = 'CD0007' where name = 'Activaciones a Un Brazo' and code is distinct from 'CD0007';
update exercises set code = 'CD0008' where name = 'Activaciones de Hombro - ISO - 10 s' and code is distinct from 'CD0008';
update exercises set code = 'CD0009' where name = 'Aperturas de Pecho - Fuerza' and code is distinct from 'CD0009';
update exercises set code = 'CD0010' where name = 'Aperturas Inclinado - Fuerza' and code is distinct from 'CD0010';
update exercises set code = 'CD0011' where name = 'Compresión - Fuerza' and code is distinct from 'CD0011';
update exercises set code = 'CD0012' where name = 'Constructor de Tensión' and code is distinct from 'CD0012';
update exercises set code = 'CD0013' where name = 'Core - 3' and code is distinct from 'CD0013';
update exercises set code = 'CD0014' where name = 'Core - Barra Fuerza 1' and code is distinct from 'CD0014';
update exercises set code = 'CD0015' where name = 'Core - Barra Fuerza 2' and code is distinct from 'CD0015';
update exercises set code = 'CD0016' where name = 'Core - Barra Progresión 1' and code is distinct from 'CD0016';
update exercises set code = 'CD0017' where name = 'Core - Barra Progresión 2' and code is distinct from 'CD0017';
update exercises set code = 'CD0018' where name = 'Core 7' and code is distinct from 'CD0018';
update exercises set code = 'CD0019' where name = 'Core 8' and code is distinct from 'CD0019';
update exercises set code = 'CD0020' where name = 'Core 9' and code is distinct from 'CD0020';
update exercises set code = 'CD0021' where name = 'Core en Piso 1' and code is distinct from 'CD0021';
update exercises set code = 'CD0022' where name = 'Core en Piso 2' and code is distinct from 'CD0022';
update exercises set code = 'CD0023' where name = 'Core Equipo de Buceo' and code is distinct from 'CD0023';
update exercises set code = 'CD0024' where name = 'Curl de Antebrazo con Mancuernas' and code is distinct from 'CD0024';
update exercises set code = 'CD0025' where name = 'Curl de Bíceps - Fuerza' and code is distinct from 'CD0025';
update exercises set code = 'CD0026' where name = 'Curl de Isquiotibiales en TRX - Repeticiones Medias' and code is distinct from 'CD0026';
update exercises set code = 'CD0027' where name = 'Curl Inverso - Fuerza' and code is distinct from 'CD0027';
update exercises set code = 'CD0028' where name = 'Curl Martillo - Fuerza' and code is distinct from 'CD0028';
update exercises set code = 'CD0029' where name = 'Dominada a Un Brazo - Fuerza' and code is distinct from 'CD0029';
update exercises set code = 'CD0030' where name = 'Dominada a Un Brazo - Fuerza Máxima' and code is distinct from 'CD0030';
update exercises set code = 'CD0031' where name = 'Dominadas - Fuerza' and code is distinct from 'CD0031';
update exercises set code = 'CD0032' where name = 'Dominadas - Test de Fuerza' and code is distinct from 'CD0032';
update exercises set code = 'CD0033' where name = 'Dominadas Supinas - Fuerza' and code is distinct from 'CD0033';
update exercises set code = 'CD0034' where name = 'Elevación Lateral - Fuerza' and code is distinct from 'CD0034';
update exercises set code = 'CD0035' where name = 'Encogimiento de Hombros Inclinado - Fuerza' and code is distinct from 'CD0035';
update exercises set code = 'CD0036' where name = 'Enhebrar la Aguja - Repeticiones Medias' and code is distinct from 'CD0036';
update exercises set code = 'CD0037' where name = 'Espalda al Vacio' and code is distinct from 'CD0037';
update exercises set code = 'CD0038' where name = 'Extensión de Tríceps - Fuerza' and code is distinct from 'CD0038';
update exercises set code = 'CD0039' where name = 'Extensión de Tríceps en Supino - Fuerza' and code is distinct from 'CD0039';
update exercises set code = 'CD0040' where name = 'Face Pulls - Fuerza' and code is distinct from 'CD0040';
update exercises set code = 'CD0041' where name = 'Flexiones - Fuerza' and code is distinct from 'CD0041';
update exercises set code = 'CD0042' where name = 'Flexiones a Un Brazo - Fuerza' and code is distinct from 'CD0042';
update exercises set code = 'CD0043' where name = 'Flexiones de Potencia' and code is distinct from 'CD0043';
update exercises set code = 'CD0044' where name = 'Flexiones Escapulares - Repeticiones Medias' and code is distinct from 'CD0044';
update exercises set code = 'CD0045' where name = 'Fondos de Tríceps - Fuerza' and code is distinct from 'CD0045';
update exercises set code = 'CD0046' where name = 'Fondos en Barra - Fuerza' and code is distinct from 'CD0046';
update exercises set code = 'CD0047' where name = 'Generación de Potencia' and code is distinct from 'CD0047';
update exercises set code = 'CD0048' where name = 'Hollow Body Hold 30 s' and code is distinct from 'CD0048';
update exercises set code = 'CD0049' where name = 'Hombros a Prueba de Balas' and code is distinct from 'CD0049';
update exercises set code = 'CD0050' where name = 'Lock Offs - 10 s' and code is distinct from 'CD0050';
update exercises set code = 'CD0051' where name = 'Lock Offs a Un Brazo - 10 s' and code is distinct from 'CD0051';
update exercises set code = 'CD0052' where name = 'Lock Offs de Densidad' and code is distinct from 'CD0052';
update exercises set code = 'CD0053' where name = 'Negativas - Fuerza' and code is distinct from 'CD0053';
update exercises set code = 'CD0054' where name = 'Negativas - Fuerza Máxima' and code is distinct from 'CD0054';
update exercises set code = 'CD0055' where name = 'Negativas a Un Brazo - Fuerza' and code is distinct from 'CD0055';
update exercises set code = 'CD0056' where name = 'Negativas a Un Brazo - Fuerza Máxima' and code is distinct from 'CD0056';
update exercises set code = 'CD0057' where name = 'Patada de Tríceps - Fuerza' and code is distinct from 'CD0057';
update exercises set code = 'CD0058' where name = 'Peso Muerto - Fuerza' and code is distinct from 'CD0058';
update exercises set code = 'CD0059' where name = 'Plancha Copenhague 30 s' and code is distinct from 'CD0059';
update exercises set code = 'CD0060' where name = 'Powerlifting' and code is distinct from 'CD0060';
update exercises set code = 'CD0061' where name = 'Press Arnold - Fuerza' and code is distinct from 'CD0061';
update exercises set code = 'CD0062' where name = 'Press de Banca - Fuerza' and code is distinct from 'CD0062';
update exercises set code = 'CD0063' where name = 'Press de Hombro con Mancuernas - Fuerza' and code is distinct from 'CD0063';
update exercises set code = 'CD0064' where name = 'Press de Pecho - Fuerza' and code is distinct from 'CD0064';
update exercises set code = 'CD0065' where name = 'Press de Pecho Inclinado - Fuerza' and code is distinct from 'CD0065';
update exercises set code = 'CD0066' where name = 'Press de Pesa Rusa Invertida - Fuerza' and code is distinct from 'CD0066';
update exercises set code = 'CD0067' where name = 'Pseudo Flexiones - Fuerza' and code is distinct from 'CD0067';
update exercises set code = 'CD0068' where name = 'Puente de Glúteos - Fuerza' and code is distinct from 'CD0068';
update exercises set code = 'CD0069' where name = 'Pullover de Dorsales - Fuerza' and code is distinct from 'CD0069';
update exercises set code = 'CD0070' where name = 'Push Press con Barra - Fuerza' and code is distinct from 'CD0070';
update exercises set code = 'CD0071' where name = 'Rack Pull - Fuerza' and code is distinct from 'CD0071';
update exercises set code = 'CD0072' where name = 'Remo Arquero - Fuerza' and code is distinct from 'CD0072';
update exercises set code = 'CD0073' where name = 'Remo Bajo - Fuerza' and code is distinct from 'CD0073';
update exercises set code = 'CD0074' where name = 'Remo Colgado - Fuerza' and code is distinct from 'CD0074';
update exercises set code = 'CD0075' where name = 'Remo Inclinado - Fuerza' and code is distinct from 'CD0075';
update exercises set code = 'CD0076' where name = 'Retracción Escapular con Mancuerna - Fuerza' and code is distinct from 'CD0076';
update exercises set code = 'CD0077' where name = 'Rotaciones de Hombro con Banda - Fuerza' and code is distinct from 'CD0077';
update exercises set code = 'CD0078' where name = 'Rotaciones de Hombro en Prono - Fuerza' and code is distinct from 'CD0078';
update exercises set code = 'CD0079' where name = 'Rotaciones de Hombro Sentado - Fuerza' and code is distinct from 'CD0079';
update exercises set code = 'CD0080' where name = 'Rutina de Calistenia de 10 Minutos para Escaladores' and code is distinct from 'CD0080';
update exercises set code = 'CD0081' where name = 'Secuencia TRX IYT en Prono - Repeticiones Medias' and code is distinct from 'CD0081';
update exercises set code = 'CD0082' where name = 'Secuencia TRX IYT en Supino - Fuerza' and code is distinct from 'CD0082';
update exercises set code = 'CD0083' where name = 'Sentadilla Goblet - Fuerza' and code is distinct from 'CD0083';
update exercises set code = 'CD0084' where name = 'Sentadilla Trasera - Fuerza' and code is distinct from 'CD0084';
update exercises set code = 'CD0085' where name = 'Superserie de Potencia de Tracción' and code is distinct from 'CD0085';
update exercises set code = 'CD0086' where name = 'Swings con Pesa Rusa - Fuerza' and code is distinct from 'CD0086';
update exercises set code = 'CD0087' where name = 'Tracciones Anchas - Fuerza' and code is distinct from 'CD0087';
update exercises set code = 'CD0088' where name = 'Tracciones de Potencia' and code is distinct from 'CD0088';
update exercises set code = 'CD0089' where name = 'Zancada Caminando con Mancuernas - Fuerza' and code is distinct from 'CD0089';
update exercises set code = 'FB0001' where name = 'F2 Open - Levantamiento - Fácil' and code is distinct from 'FB0001';
update exercises set code = 'FB0002' where name = 'F2 Open - Levantamiento - Fuerza' and code is distinct from 'FB0002';
update exercises set code = 'FB0003' where name = 'F2 Open - Levantamiento - Máximo' and code is distinct from 'FB0003';
update exercises set code = 'FB0004' where name = 'F2 Open - Levantamiento - Peak' and code is distinct from 'FB0004';
update exercises set code = 'FB0005' where name = 'F3 Half Crimp - Levantamiento - Fuerza' and code is distinct from 'FB0005';
update exercises set code = 'FB0006' where name = 'F3 Half Crimp - Levantamiento - Máximo' and code is distinct from 'FB0006';
update exercises set code = 'FB0007' where name = 'Half Crimp 4 - Levantamiento - Base' and code is distinct from 'FB0007';
update exercises set code = 'FB0008' where name = 'Half Crimp 4 - Levantamiento - Fuerza' and code is distinct from 'FB0008';
update exercises set code = 'FB0009' where name = 'Half Crimp 4 - Levantamiento - Máximo' and code is distinct from 'FB0009';
update exercises set code = 'FB0010' where name = 'Half Crimp 4 - Levantamiento - Test Máximo' and code is distinct from 'FB0010';
update exercises set code = 'FB0011' where name = 'Half Crimp 4 - Repeticiones - Fuerza' and code is distinct from 'FB0011';
update exercises set code = 'FB0012' where name = 'Levantamientos de Reclutamiento de Flexores de Dedos' and code is distinct from 'FB0012';
update exercises set code = 'FB0013' where name = 'M2 Open - Levantamiento - Fácil' and code is distinct from 'FB0013';
update exercises set code = 'FB0014' where name = 'M2 Open - Levantamiento - Fuerza' and code is distinct from 'FB0014';
update exercises set code = 'FB0015' where name = 'M2 Open - Levantamiento - Máximo' and code is distinct from 'FB0015';
update exercises set code = 'FB0016' where name = 'M2 Open - Levantamiento - Peak' and code is distinct from 'FB0016';
update exercises set code = 'FL0001' where name = 'Aductores de Cadera' and code is distinct from 'FL0001';
update exercises set code = 'FL0002' where name = 'Calentamiento y Vuelta a la Calma' and code is distinct from 'FL0002';
update exercises set code = 'FL0003' where name = 'Dislocaciones de Hombro - Estiramiento con Tempo' and code is distinct from 'FL0003';
update exercises set code = 'FL0004' where name = 'Elevación en Barra - Lateral' and code is distinct from 'FL0004';
update exercises set code = 'FL0005' where name = 'Estiramiento de Bíceps - Estático Pasivo' and code is distinct from 'FL0005';
update exercises set code = 'FL0006' where name = 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo' and code is distinct from 'FL0006';
update exercises set code = 'FL0007' where name = 'Estiramiento de Flexor de Cadera en Pared - Estático Pasivo' and code is distinct from 'FL0007';
update exercises set code = 'FL0008' where name = 'Estiramiento de Gemelo en Pared - Estático Pasivo' and code is distinct from 'FL0008';
update exercises set code = 'FL0009' where name = 'Estiramiento de Isquiotibiales - Sentado - Estático Pasivo' and code is distinct from 'FL0009';
update exercises set code = 'FL0010' where name = 'Estiramiento de Muñeca - Estático Pasivo' and code is distinct from 'FL0010';
update exercises set code = 'FL0011' where name = 'Estiramiento de Pecho - Estático Pasivo' and code is distinct from 'FL0011';
update exercises set code = 'FL0012' where name = 'Estiramiento Revolver - Estático Pasivo' and code is distinct from 'FL0012';
update exercises set code = 'FL0013' where name = 'Estiramiento Sleeper - Estático Pasivo' and code is distinct from 'FL0013';
update exercises set code = 'FL0014' where name = 'Estiramientos de Dedos - Estático Pasivo' and code is distinct from 'FL0014';
update exercises set code = 'FL0015' where name = 'Fire Hydrant - Pierna Flexionada - Desarrollo de Fuerza' and code is distinct from 'FL0015';
update exercises set code = 'FL0016' where name = 'Flexibilidad de Antebrazo' and code is distinct from 'FL0016';
update exercises set code = 'FL0017' where name = 'Flexibilidad de Tobillo' and code is distinct from 'FL0017';
update exercises set code = 'FL0018' where name = 'Glúteos e Isquiotibiales' and code is distinct from 'FL0018';
update exercises set code = 'FL0019' where name = 'Good Morning Sentado - Estiramiento con Tempo' and code is distinct from 'FL0019';
update exercises set code = 'FL0020' where name = 'Mantenimiento de Flexibilidad' and code is distinct from 'FL0020';
update exercises set code = 'FL0021' where name = 'Movilidad Matutina' and code is distinct from 'FL0021';
update exercises set code = 'FL0022' where name = 'Pancake - De Pie - Estático Pasivo' and code is distinct from 'FL0022';
update exercises set code = 'FL0023' where name = 'Pancake - Pulsos' and code is distinct from 'FL0023';
update exercises set code = 'FL0024' where name = 'Patadas Frontales - Dinámico' and code is distinct from 'FL0024';
update exercises set code = 'FL0025' where name = 'Patadas Laterales - Dinámico' and code is distinct from 'FL0025';
update exercises set code = 'FL0026' where name = 'Peso Muerto Rumano a Una Pierna - Estiramiento con Tempo' and code is distinct from 'FL0026';
update exercises set code = 'FL0027' where name = 'Postura de Caballo - ISO - Estático Activo' and code is distinct from 'FL0027';
update exercises set code = 'FL0028' where name = 'Postura de Paloma - Contrae y Relaja' and code is distinct from 'FL0028';
update exercises set code = 'FL0029' where name = 'Pullover de Dorsales con Mancuerna - Estiramiento con Tempo' and code is distinct from 'FL0029';
update exercises set code = 'FL0030' where name = 'Pulsos de Split Frontal - Dinámico' and code is distinct from 'FL0030';
update exercises set code = 'FL0031' where name = 'Pulsos y Patadas' and code is distinct from 'FL0031';
update exercises set code = 'FL0032' where name = 'Rana Supina - Estático Pasivo' and code is distinct from 'FL0032';
update exercises set code = 'FL0033' where name = 'Rotación Externa con Banda - Contrae y Relaja' and code is distinct from 'FL0033';
update exercises set code = 'FL0034' where name = 'Sentadillas Cosaco - Estiramiento con Tempo' and code is distinct from 'FL0034';
update exercises set code = 'FL0035' where name = 'Sentadillas Split - Estiramiento con Tempo' and code is distinct from 'FL0035';
update exercises set code = 'FL0036' where name = 'Split Frontal - Nivel 1' and code is distinct from 'FL0036';
update exercises set code = 'FL0037' where name = 'Split Lateral - Nivel 1' and code is distinct from 'FL0037';
update exercises set code = 'FL0038' where name = 'Split Lateral ISO - Estático Activo' and code is distinct from 'FL0038';
update exercises set code = 'FL0039' where name = 'Test de Split Lateral - Sin Apoyo' and code is distinct from 'FL0039';
update exercises set code = 'FL0040' where name = 'Zancada Larga ISO - Estático Pasivo' and code is distinct from 'FL0040';
update exercises set code = 'PE0001' where name = '30 Movimientos Fraccionados' and code is distinct from 'PE0001';
update exercises set code = 'PE0002' where name = '4x4' and code is distinct from 'PE0002';
update exercises set code = 'PE0003' where name = '5 Series Más Difíciles' and code is distinct from 'PE0003';
update exercises set code = 'PE0004' where name = '6 en 6' and code is distinct from 'PE0004';
update exercises set code = 'PE0005' where name = 'A Vista' and code is distinct from 'PE0005';
update exercises set code = 'PE0006' where name = 'Boulders Enlazados' and code is distinct from 'PE0006';
update exercises set code = 'PE0007' where name = 'Boulders Extendidos' and code is distinct from 'PE0007';
update exercises set code = 'PE0008' where name = 'Dobles de Boulder' and code is distinct from 'PE0008';
update exercises set code = 'PE0009' where name = 'Dobles de Ruta' and code is distinct from 'PE0009';
update exercises set code = 'PE0010' where name = 'Kilometraje de Boulder - Intervalos Forzados' and code is distinct from 'PE0010';
update exercises set code = 'PE0011' where name = 'Pirámide de Rutas' and code is distinct from 'PE0011';
update exercises set code = 'PE0012' where name = 'Proyectando Rutas' and code is distinct from 'PE0012';
update exercises set code = 'PE0013' where name = 'Proyecto de Capacidad Anaeróbica' and code is distinct from 'PE0013';
update exercises set code = 'PE0014' where name = 'Test de Repeticiones al 60%' and code is distinct from 'PE0014';
update exercises set code = 'PE0015' where name = 'Triples de Boulder' and code is distinct from 'PE0015';
update exercises set code = 'SP0001' where name = 'Campus - 3 Movimientos' and code is distinct from 'SP0001';
update exercises set code = 'SP0002' where name = 'Circuitos de Boulder' and code is distinct from 'SP0002';
update exercises set code = 'SP0003' where name = 'Eficiencia en Board' and code is distinct from 'SP0003';
update exercises set code = 'SP0004' where name = 'Eliminados' and code is distinct from 'SP0004';
update exercises set code = 'SP0005' where name = 'Encadenando a Vista (Flash)' and code is distinct from 'SP0005';
update exercises set code = 'SP0006' where name = 'Encadenando Boulder' and code is distinct from 'SP0006';
update exercises set code = 'SP0007' where name = 'Encadenando en Board' and code is distinct from 'SP0007';
update exercises set code = 'SP0008' where name = 'Enfoque de Boulder' and code is distinct from 'SP0008';
update exercises set code = 'SP0009' where name = 'Esfuerzos Máximos de Boulder' and code is distinct from 'SP0009';
update exercises set code = 'SP0010' where name = 'Esfuerzos Máximos de Boulder Sin Pies' and code is distinct from 'SP0010';
update exercises set code = 'SP0011' where name = 'Esfuerzos Máximos en Board' and code is distinct from 'SP0011';
update exercises set code = 'SP0012' where name = 'Esfuerzos Máximos en Board - Extendido' and code is distinct from 'SP0012';
update exercises set code = 'SP0013' where name = 'Intervalos de Fuerza' and code is distinct from 'SP0013';
update exercises set code = 'SP0014' where name = 'Juego de Boulder' and code is distinct from 'SP0014';
update exercises set code = 'SP0015' where name = 'Kilometraje de Boulder' and code is distinct from 'SP0015';
update exercises set code = 'SP0016' where name = 'Pausas en Board' and code is distinct from 'SP0016';
update exercises set code = 'SP0017' where name = 'Pirámide de Boulder' and code is distinct from 'SP0017';
update exercises set code = 'SP0018' where name = 'Referencias de MoonBoard' and code is distinct from 'SP0018';
update exercises set code = 'SP0019' where name = 'Sesión de Board' and code is distinct from 'SP0019';
update exercises set code = 'SP0020' where name = 'Sesión de Competencia - Final' and code is distinct from 'SP0020';
update exercises set code = 'SP0021' where name = 'Sesión de Competencia - Semifinal' and code is distinct from 'SP0021';
update exercises set code = 'SP0022' where name = 'Tensión - Manos Fijas' and code is distinct from 'SP0022';
update exercises set code = 'SP0023' where name = 'Volumen de Board' and code is distinct from 'SP0023';

-- Verificacion previa: si algun nombre no matcheo (typo, ejercicio
-- renombrado, etc.), frena aca con un mensaje claro en vez de fallar mas
-- abajo con un error generico de NOT NULL (que ademas revierte todo).
do $$
declare
  faltantes text;
begin
  select string_agg(name, ', ') into faltantes from exercises where code is null;
  if faltantes is not null then
    raise exception 'Quedaron ejercicios sin code (revisa nombres/typos): %', faltantes;
  end if;
end $$;

alter table exercises alter column code set not null;
alter table exercises add constraint exercises_code_unique unique (code);

-- Trigger: si se agrega un ejercicio nuevo desde /catalogo sin code, se le
-- asigna automaticamente el siguiente correlativo de su categoria.
create or replace function assign_exercise_code()
returns trigger as $$
declare
  prefix text;
  next_num int;
begin
  if new.code is not null and new.code <> '' then
    return new;
  end if;

  prefix := case new.category
    when 'Aerobic Base' then 'AB'
    when 'Conditioning' then 'CD'
    when 'Power Endurance' then 'PE'
    when 'Strength and Power' then 'SP'
    when 'Flexibility' then 'FL'
    when 'Fingerboard' then 'FB'
    when 'Otro' then 'OT'
    else 'XX'
  end;

  select coalesce(max(substring(code from 3)::int), 0) + 1
  into next_num
  from exercises
  where code like prefix || '%';

  new.code := prefix || lpad(next_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assign_exercise_code on exercises;
create trigger trg_assign_exercise_code
  before insert on exercises
  for each row
  execute function assign_exercise_code();
