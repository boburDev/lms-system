create or replace function activity_colleagues(
    start_date timestamp without time zone,
    end_date timestamp with time zone,
    colleague_id uuid
)
    RETURNS BIGINT
    LANGUAGE plpgsql
AS
$$
DECLARE
    start_time  bigint;
    end_time    bigint;
    online_time bigint;
    time_1 bigint;
    r           record;
    count       integer;

BEGIN
    start_time = 0;
    end_time = 0;
    online_time = 0;

    count = (end_date::date - start_date::date) + 1;

    FOR i in 1 .. count
        loop
        time_1 = 0;
            FOR r IN SELECT * FROM connect_time c WHERE c.colleague_id = colleague_id AND (c.connect_time_created)::date = (start_date)::date
                LOOP
                    continue when r.disconnect_time = 0;
                    time_1 = time_1 + (r.disconnect_time - r.connect_time);
                end loop;
            online_time = online_time + time_1;
            start_date = start_date + INTERVAL '1 day';
        end loop;

    RETURN online_time / 1000;
END
$$;