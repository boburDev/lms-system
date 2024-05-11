CREATE OR REPLACE FUNCTION check_group(
    group_days VARCHAR,
    search_days VARCHAR,
    start_time VARCHAR,
    end_time VARCHAR,
    search_time1 VARCHAR,
    search_time2 VARCHAR
)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
DECLARE
    search_day    varchar;
    i             varchar;
    is_next_day   BOOLEAN;
    next_days     varchar;
    start_time_n  integer;
    end_time_n    integer;
    search_time_1 integer;
    search_time_2 integer;
BEGIN
    start_time_n = NULLIF(regexp_replace(start_time, '\D', '', 'g'), '')::NUMERIC;
    end_time_n = NULLIF(regexp_replace(end_time, '\D', '', 'g'), '')::NUMERIC;
    search_time_1 = NULLIF(regexp_replace(search_time1, '\D', '', 'g'), '')::NUMERIC;
    search_time_2 = NULLIF(regexp_replace(search_time2, '\D', '', 'g'), '')::NUMERIC;

    IF start_time_n > end_time_n OR search_time2 < search_time1 THEN
        is_next_day = TRUE;
    ELSE
        is_next_day = FALSE;
    END IF;

    next_days = '';

    FOR i IN SELECT regexp_split_to_table(group_days, ',')
        LOOP
            IF is_next_day = TRUE THEN
                IF i::integer + 1 < 8 THEN
                    next_days = next_days || i::integer + 1;
                ELSE
                    next_days = next_days || 1;
                END IF;
            END IF;
        END LOOP;


    FOR search_day IN SELECT regexp_split_to_table(search_days, ',')
        LOOP
            IF is_next_day = TRUE THEN
                IF (group_days LIKE '%' || search_day || '%' OR next_days LIKE '%' || search_day || '%') AND
                   start_time_n > end_time_n AND
                   (((start_time_n <= search_time_1 AND search_time_1 <= 2400) or
                     (0 <= search_time_1 AND search_time_1 <= end_time_n)) OR
                    (start_time_n <= search_time_2 AND search_time_2 <= 2400) or
                    (0 <= search_time_2 AND search_time_2 <= end_time_n)) THEN
                    RETURN TRUE;
                ELSIF (start_time_n <= search_time_1 AND search_time_1 <= end_time_n) OR
                      (start_time_n <= search_time_2 AND search_time_2 <= end_time_n) THEN
                    RETURN TRUE;
                END IF;
            ELSE
                IF (group_days LIKE '%' || search_day || '%') AND
                   ((start_time_n <= search_time_1 AND search_time_1 <= end_time_n) OR
                    (start_time_n <= search_time_2 AND search_time_2 <= end_time_n)
                       ) THEN
                    RETURN TRUE;
                END IF;
            END IF;
        END LOOP;
    RETURN FALSE;
END
$$;
