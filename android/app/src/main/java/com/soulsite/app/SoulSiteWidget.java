package com.soulsite.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.TimeZone;

/**
 * Home-screen widget showing the day's card and moon phase.
 *
 * It derives both itself rather than reading anything the app wrote, so it is
 * correct on a phone where SoulSite has never been opened, and can't go stale
 * if the user stops launching it. The card selection mirrors
 * dailyForecastService.js exactly — same YYYY-MM-DD key, same hash, same
 * modulo — so the widget and the app always name the same card.
 */
public class SoulSiteWidget extends AppWidgetProvider {

    private static final String ACTION_REFRESH = "com.soulsite.app.WIDGET_REFRESH";
    private static final double SYNODIC_MONTH = 29.53058867;
    private static final double KNOWN_NEW_MOON_JD = 2451549.260;

    // Mirrors dateSeed() in src/services/dailyForecastService.js: hash the
    // UTC date key, keeping the >>> 0 unsigned wrap that JS applies.
    private static long dateSeed(String isoDay) {
        long hash = 0;
        for (int i = 0; i < isoDay.length(); i++) {
            hash = (hash * 31 + isoDay.charAt(i)) & 0xFFFFFFFFL;
        }
        return hash;
    }

    private static String utcDayKey() {
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        return String.format(
                java.util.Locale.US, "%04d-%02d-%02d",
                c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    private static double moonPhaseDay() {
        double jd = System.currentTimeMillis() / 86400000.0 + 2440587.5;
        double days = (jd - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH;
        if (days < 0) days += SYNODIC_MONTH;
        return days;
    }

    private static JSONObject loadData(Context ctx) throws Exception {
        InputStream in = ctx.getResources().openRawResource(R.raw.widget_data);
        byte[] buf = new byte[in.available()];
        int read = in.read(buf);
        in.close();
        return new JSONObject(new String(buf, 0, read, StandardCharsets.UTF_8));
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_soulsite);
        try {
            JSONObject data = loadData(ctx);

            JSONArray cards = data.getJSONArray("cards");
            int idx = (int) (dateSeed(utcDayKey()) % cards.length());
            JSONObject card = cards.getJSONObject(idx);
            views.setTextViewText(R.id.widget_card_name, card.getString("name"));
            views.setTextViewText(R.id.widget_card_meaning, card.getString("meaning"));

            double days = moonPhaseDay();
            JSONArray phases = data.getJSONArray("moonPhases");
            String phaseName = phases.getJSONObject(0).getString("name");
            for (int i = 0; i < phases.length(); i++) {
                JSONObject p = phases.getJSONObject(i);
                if (days >= p.getDouble("from") && days < p.getDouble("to")) {
                    phaseName = p.getString("name");
                    break;
                }
            }
            int illumination = (int) Math.round(50 * (1 - Math.cos(2 * Math.PI * days / SYNODIC_MONTH)));
            views.setTextViewText(R.id.widget_moon, phaseName + " · " + illumination + "%");
        } catch (Exception e) {
            // A widget that renders an error is better than one that renders
            // a blank rectangle the user can't diagnose.
            views.setTextViewText(R.id.widget_card_name, "SoulSite");
            views.setTextViewText(R.id.widget_card_meaning, "Tap to open");
            views.setTextViewText(R.id.widget_moon, "");
        }

        Intent open = new Intent(ctx, MainActivity.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        views.setOnClickPendingIntent(R.id.widget_root,
                PendingIntent.getActivity(ctx, 0, open, flags));
        return views;
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        RemoteViews views = buildViews(ctx);
        for (int id : ids) mgr.updateAppWidget(id, views);
        scheduleMidnight(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        // The receiver is not exported, so the system's DATE_CHANGED broadcast
        // would never reach it — the midnight alarm below is what actually rolls
        // the card over, and it re-arms itself on every update.
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, SoulSiteWidget.class));
            if (ids.length > 0) onUpdate(ctx, mgr, ids);
        }
    }

    /**
     * updatePeriodMillis can't go below 30 minutes and is throttled further in
     * doze, so the card could visibly lag past midnight. This lines a refresh
     * up with the date rolling over. Deliberately inexact — an exact alarm
     * needs a special permission on Android 12+, and a widget is not worth
     * asking for one.
     */
    private void scheduleMidnight(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar next = Calendar.getInstance();
        next.add(Calendar.DAY_OF_YEAR, 1);
        next.set(Calendar.HOUR_OF_DAY, 0);
        next.set(Calendar.MINUTE, 0);
        next.set(Calendar.SECOND, 5);
        next.set(Calendar.MILLISECOND, 0);

        Intent i = new Intent(ctx, SoulSiteWidget.class).setAction(ACTION_REFRESH);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        am.set(AlarmManager.RTC, next.getTimeInMillis(),
                PendingIntent.getBroadcast(ctx, 1, i, flags));
    }
}
